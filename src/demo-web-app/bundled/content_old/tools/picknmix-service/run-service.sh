# run this script in its containing folder.

# It sets up routes for;
# remote/catalogue 			- location to pull catalogue info from
# remote/catalogue-image	- location to pull catalogue images from, configured separately for flexibility

# set up a remote routing for audio (currently NA here, but used in Playtime Island)
REMOTE_AUDIO_MAPPING=/remote/catalogue-audio^https://childrens-data.test.api.bbci.co.uk/apps/cbeebies-playtime-island-qa/downloads/audio

# set up a remote routing for catalogue images (currently NA here, but used in Playtime Island)
REMOTE_IMAGES_MAPPING=/remote/catalogue-image^https://childrens-data.test.api.bbci.co.uk/apps/cbeebies-playtime-island-qa/downloads/images

# set up a remote routing for downloadable packages (currently NA here, but used in Playtime Island)
REMOTE_DOWNLOADS_MAPPING=/remote/catalogue^https://childrens-data.test.api.bbci.co.uk/apps/cbeebies-playtime-island-qa/downloads

# local folder to server packages from - the simulation doesn't actually download packages, it just provides the correct responses
# for testing UI behaviour, placing the actual package content here makes it available as if it was in a real package.
# each "fake package" should consist of a suitably named folder with a config.json and some app specific content
PACKAGES_FOLDER=./../../test-packages

# location to server the index.html from
SOURCE_FOLDER=./../../

node picknmix-service.js -x $REMOTE_AUDIO_MAPPING -x $REMOTE_IMAGES_MAPPING -x $REMOTE_DOWNLOADS_MAPPING --packages  $PACKAGES_FOLDER -s $SOURCE_FOLDER
