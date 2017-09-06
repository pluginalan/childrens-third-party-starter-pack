# run this script in the folder you want to serve the Playtime Island package from.
# It sets up routes for;
# remote/catalogue 			- location to pull catalogue info from
# remote/catalogue-image	- location to pull catalogue images from, configured separately for flexibility

node picknmix-service.js -x /remote/catalogue-image^https://s3-eu-west-1.amazonaws.com/childrens-data-public-int/apps/cbeebies-playtime-island-dev/data/catalogue/images -x /remote/catalogue^https://s3-eu-west-1.amazonaws.com/childrens-data-public-int/apps/cbeebies-playtime-island-dev/data/catalogue -d 30000000 --packages ./../../fake-packages -s ./../../../webBuild

