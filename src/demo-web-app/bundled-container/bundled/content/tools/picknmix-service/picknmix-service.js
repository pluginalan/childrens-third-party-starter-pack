var express = require('express')
var program = require('commander')
var proxy = require('http-proxy-middleware')
var fs = require('fs')
var https = require('https');
var http = require('http');
var url = require("url");
var cron = require('node-cron');
var app = express()
var path = require('path');

// Download progress simulation
var downloadTasks=[]

// Local paths
var mockInstalledPackagesPath=path.resolve(__dirname, "mock-installed-packages")
var localJsonResponsePath = path.resolve(__dirname, "responses")

// Default proxy configuration - will be discarded if any proxy is configured at the command line.
var proxyConfigs=[
  {path:"/aws", target:"https://s3-eu-west-1.amazonaws.com/childrens-data-public-int/apps/cbeebies-playtime-island-dev/data"}]

// Parse command-line options
// This first function is a helper to allow us to build a set of proxies from repeated use of the corresponding command-line option
function proxies(val, proxyList) {
  proxyFragments=val.split("^")
  var proxyEntry={}
  proxyEntry.path = proxyFragments[0]
  proxyEntry.target = proxyFragments[1]
  proxyList.push(proxyEntry);
  return proxyList;
}

program
	.option('-p, --port <number>', 'Set listening port [3030]', 3030)
  .option('-s, --static <path>', 'Set static file path [.]', '.')
  .option('--packages <path>', 'Set path to folder of (externally provided) static test packages [./packages]', './packages')
  .option('-d, --diskspace <bytes>', 'Set available disk storage [524288000]', 524288000)
  .option('-x, --proxyconfig <path^target>', 'Set details of a proxy path and target (separated by ^). This option may be repeated as many times as necessary', proxies, [])
  .option('--incrementtime <seconds>','Set interval (0-60) between downloading steps',1)
  .parse(process.argv);

// Ensure we use the default proxy setup above only if none have been explicitly configured
if(program.proxyconfig && program.proxyconfig.length>0){
  proxyConfigs = program.proxyconfig
}

// The output from HPM doesn't show the proxy path, only the target, so we'll show ther full setup on execution for debug purposes
console.log("Proxy configuration:\n====================")
console.log(proxyConfigs)

// UTILITY METHODS FOR API MIDDLEWARE
// Used strictly for sending an unmodified JSON file as a response
function sendJsonFileResponse(filename,res){
  if(fs.existsSync(filename)){
  var jsonResponse = fs.readFileSync(filename)
  res.setHeader('Content-Type', 'application/json')
  res.write(jsonResponse)
  res.status(200)
  } else {
  res.status(404)
  }
  res.end()
}

// Use this when a JSON object needs to be built programmatically based on an existing file.
function readFileAsJson(filename) {
  if(fs.existsSync(filename)){
    var contents = fs.readFileSync(filename)
    var jsonContent = JSON.parse(contents)
    return jsonContent
  } 
}

// The following two functions are included so that the paths for responses and packages
// can easily be changed at the top of this file.
function jsonResponseFullPath(filename){
  return(path.join(localJsonResponsePath,filename))
}

function installedPackageFullPath(packageId){
  return(path.join(mockInstalledPackagesPath,packageId))
}

// Logging middleware - outputs request log and then allows next middleware piece to run, if any match the request
app.use(function (req,res,next) {
  console.log(new Date(), req.method, req.url);
  next();
})

// OVERRIDE MIDDLEWARE
// This section allows the configuration of specific paths, which, if requested, will return pre-configured responses
// instead of going through what might be the normal middleware.
// TODO? - should an overridden path be removed once triggered, or configured to happen a given number of times before removal?
//         At present, the list of overrides will remain unchanged over the runtime of the service.
//         One alternative might be to have a method which forces the file to refresh, so it can be modified at runtime.
var overrideQueue = readFileAsJson(jsonResponseFullPath("overrides.json"))

app.use(function (req,res,next) {
  var i=0
  var overrideFound = false
  while(i<overrideQueue.length && !overrideFound) {
    if(req.path==overrideQueue[i].path) {
      overrideFound = true
      res.send(overrideQueue[i].response).end
    }
    i++
  }

  // Allow normal middleware to run
  if(!overrideFound){
    next()
  }
})

// PROXY MIDDLEWARE
// Set this up from a list of proxy source and targets specified by the user
var i = 0
for(i=0; i < proxyConfigs.length; i++){
  var proxyConfig = proxyConfigs[i]
  var proxyAgent = http.globalAgent
  var proxyPath = proxyConfig.path
  var targetUrl = url.parse(proxyConfig.target)
  
  // Scheme is checked to work out which global agent needs to be used.
  if(targetUrl && targetUrl.protocol=="https:"){
    proxyAgent = https.globalAgent
  }
  var proxyTarget = proxyConfig.target

  app.use(proxyPath, proxy({target: proxyTarget, changeOrigin:true, agent:proxyAgent, pathRewrite: function(proxyPath,path,req){
    return path.replace(proxyPath,'')}.bind(this,proxyPath)}));
}


// STATIC FILE SERVING MIDDLEWARE
// Special-case static serving for extracted packages. This is locally-hosted content which isn't part of the menu itself.
app.use('/package', express.static(program.packages))
// Static file serving (for application main menu, etc)
app.use(express.static(program.static))

// PACKAGE MANAGER HELPERS

// Infrastructure for simulating download progress
// Kick off internal cron job to simulate a constantly-running download thread
var cronTabString='*/'+program.incrementtime+' * * * * *'
var downloadBehaviour = function(){
  var i
  // Move all downloads along by the same amount, until 100% is reached
  // At that point, the status will be changed to represent the installation process
  // Note: error cases are not simulated in this version.
  for(i = downloadTasks.length-1; i>=0; i--){
      // only advance progress indication for currently-running downloads with no errors
      if(downloadTasks[i].progress < 100) {
        if(downloadTasks[i].status == "downloading"){
          downloadTasks[i].progress += 10
        }
      } else {
        // 100% done items in "installing" should move to "installed"
        // 100% done items in "downloading" should move to "installing"
        switch(downloadTasks[i].status){
          case "downloading":
            downloadTasks[i].status = "installing"
            break
          case "installing":
            downloadTasks[i].status = "installed"
            break
          default:
            break
        }
      }
  }
}
var downloadThreadSimulator = cron.schedule(cronTabString, downloadBehaviour);
downloadThreadSimulator.start()

function initiateDownload(packageId){
  downloadTasks.push({packageId: packageId, status:"downloading", progress:0})
}

function removeCompletedDownloads(){
  var downloadTerminationStatuses=["errorInterrupted","errorInsufficientSpace","errorUnknown","installed","cancelled"]
  var i
  for( i=downloadTasks.length-1; i>=0; i--) {
    // Only consider elements which have a known termination status
    if( downloadTerminationStatuses.indexOf (downloadTasks[i].status) >= 0) {
      // Remove file representing this download *if* this is an error case
      // Synchronous delete; Note: this presumes that deletion succeeds
      if(downloadTasks[i].status != "installed" && fs.existsSync(installedPackageFullPath(downloadTasks[i].packageId))){
        fs.unlinkSync(installedPackageFullPath(downloadTasks[i].packageId))
      }
      // Remove element from list of tracked downloads
      downloadTasks.splice(i,1);
    }
  }
}

// Find if a given package ID is present in the download list and currently downloading
function isDownloading(packageId){
  for( i=downloadTasks.length-1; i>=0; i--) {
    if( downloadTasks[i].packageId == packageId && downloadTasks[i].status!="installed" ) {
       return true
    }
  }
  return false
}


// PACKAGE MANAGER API MIDDLEWARE
app.get('/download-manager/download/:packageId', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    var jsonResponse = {}
    jsonResponse.packageId = req.params.packageId
    
    // Create a file using the 'metadata' query parameter (if present) as the content
    // Note: even though the file is created immediately, it will not be reported as
    // 'downloaded' until there is nothing in the download queue with the same package ID.
    var fileContent = req.query.metadata || ''
    fs.writeFile(installedPackageFullPath(req.params.packageId),fileContent,(err)=>{
        if (err) { 
            jsonResponse.status = "errorUnknown"
          } else {
            initiateDownload(req.params.packageId)
            jsonResponse.status = "downloading"
          }
         res.send(jsonResponse)
    })
})

app.get('/download-manager/delete/:packageId', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  var jsonResponse = {}
  jsonResponse.packageId = req.params.packageId

  // Synchronous delete; Note: this presumes that deletion succeeds
  if(fs.existsSync(installedPackageFullPath(req.params.packageId))){
    fs.unlinkSync(installedPackageFullPath(req.params.packageId))
    jsonResponse.status = "ok"
  } else {
    // Send "not found" response
    jsonResponse.status = "errorNotFound"
  }
  res.send(jsonResponse)
})

app.get('/download-manager/launch/:packageId', function (req, res) {
  var filename='launch-' + req.params.packageId + '.json'
  sendJsonFileResponse(jsonResponseFullPath(filename), res)
})

app.get('/download-manager/installed', function (req, res) {
  var allFiles = fs.readdirSync(mockInstalledPackagesPath)
  var jsonResponse = {}
  var availableSpace = program.diskspace
  // For each applicable file, we also have to read the content (which is our metadata, in this test service)
  var i=0
  var packages=[]
  for(i=0;i<allFiles.length;i++){
    var filename = allFiles[i]
    var currentPackageDetails = {}
    // Exclude hidden files and any file representing a package which is being downloaded.
    if(filename.charAt(0) != '.' && !isDownloading(filename) ){

      var contents = fs.readFileSync(installedPackageFullPath(filename))

        // prepare a default packageInfo
        var spaceRequired = 41943040;
        var packageInfo = {
          packageId: filename,
            version: "1.2.3",
            spaceRequired: spaceRequired
        };

        // attempt to read package-info.json from packages folder
        try {
            var packageInfoPath = program.packages+"/"+ filename + "/package-info.json"
            var packageInfoFile = fs.readFileSync(packageInfoPath)
            packageInfo = JSON.parse(packageInfoFile.toString())
        }
        catch(e) {
          console.log("failed to read/parse package-info.json for package: "+filename+", returning default instead")
        }

        availableSpace -= packageInfo.spaceRequired
        currentPackageDetails.packageInfo = packageInfo;
//        currentPackageDetails.packageInfo = JSON.stringify(packageInfo);
      currentPackageDetails.metadata = contents.toString() // Metadata is plain text, for client interpretation
      packages.push(currentPackageDetails)
    }
  }
  res.setHeader('Content-Type', 'application/json')
  jsonResponse.packages = packages
  jsonResponse.spaceAvailable = availableSpace
  jsonResponse.status="ok"
  res.send(jsonResponse)
})

app.get('/download-manager/downloading', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  var jsonResponse = {}
  // The following assignment works because the downloadProcesses object array has the
  // same layout as the response described in the download-manager spec.
  jsonResponse.packages = downloadTasks
    console.log("download-manager/downloading - " + JSON.stringify(jsonResponse));
  res.send(jsonResponse)
  // Remove any completed downloads from local list - they are only reportable once after completion
  removeCompletedDownloads()
})

app.get('/download-manager/update-metadata/:packageId', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  var jsonResponse = {}
  jsonResponse.packageId = req.params.packageId
  
  if(fs.existsSync(installedPackageFullPath(req.params.packageId))){    
    // Overwrite with new metadata
    var fileContent = req.query.metadata || ''
    fs.writeFile(installedPackageFullPath(req.params.packageId),fileContent,(err)=>{
        if (err) { 
            jsonResponse.status = "errorUnknown"
          } else {
            jsonResponse.status = "ok"
          }
         res.send(jsonResponse)
    })
  } else {
    // Send "not found" response
    jsonResponse.status = "errorNotFound"
    res.send(jsonResponse)
  }
})

app.get('/download-manager/cancel/:packageId', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  var jsonResponse = {}
  jsonResponse.status = "errorNotFound"

  // Find entry in downloadTasks that matches packageId and is not currently installing
  var installationStatuses=["installing","installed"]
  var jobFound = false
  var i = downloadTasks.length-1
  while( i >= 0 && jobFound == false) {
    if( downloadTasks[i].packageId == req.params.packageId ) {
        // Only packages which have not begun installing may be cancelled
       if(installationStatuses.indexOf(downloadTasks[i].status) == -1){
          downloadTasks[i].status = "cancelled"
          jsonResponse.status = "ok"
       } else {
         // Installation has already started, or an error has already halted progress
         // Assign current status to the response
          jsonResponse.status = downloadTasks[i].status 
       }
       jobFound = true
    }
    i--
  }
  res.send(jsonResponse)
})

// DEVELOPMENT-ONLY METHODS
// Anything in this section is intended strictly for the use of app developers to change the running state
// of this service. Public methods must not be listed here. 

// Allow external modification of download statuses (for example, to simulate errors)
app.put('/download-manager-debug/download-status/:packageId/:status', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  var jsonResponse = {}
  jsonResponse.status = "errorNotFound"

  // Find entry in downloadTasks that matches packageId and set status as specified
  var statusModified = false
  var i = downloadTasks.length-1
  while( i >= 0 && statusModified == false) {
    if( downloadTasks[i].packageId == req.params.packageId) {
       downloadTasks[i].status = req.params.status
       jsonResponse.status = "ok"
       statusModified = true
    }
    i--
  }
  res.send(jsonResponse)
})

// Change the speed of the download simulation
app.put('/download-manager-debug/increment-time/:seconds', function (req, res) {
  downloadThreadSimulator.destroy()
  var cronTabString='*/'+req.params.seconds+' * * * * *'
  downloadThreadSimulator = cron.schedule(cronTabString, downloadBehaviour);
  downloadThreadSimulator.start()
  res.sendStatus(200)
})

// Start service
app.listen(program.port, function () {
  console.log('picknmix-service listening on port '+ program.port)
})