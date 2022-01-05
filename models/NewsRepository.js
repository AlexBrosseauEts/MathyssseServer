const Repository = require('./repository');
const ImageFilesRepository = require('./newsFilesRepository.js');
const Image = require('./news.js');
const utilities = require("../utilities");
module.exports = 
class NewsRepository extends Repository {
    constructor(req){
        super('News', true);
        this.users = new Repository('Users');
        this.req = req;
        this.setBindExtraDataMethod(this.bindUsernameAndImageURL);
    }
    bindUsernameAndImageURL(image){
        if (image) {
            let user = this.users.get(image.UserId);
            let username = "unknown";
            let userProfile="unknown";
            if (user !== null)
                username = user.Name;
                userProfile=user.AvatarGUID;
            let bindedImage = {...image};
            bindedImage["Username"] = username;
            bindedImage["UserProfile"]=userProfile;
            bindedImage["Date"] = utilities.secondsToDateString(image["Created"]);
            if (image["GUID"] != ""){
                bindedImage["OriginalURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(image["GUID"]);
                bindedImage["ThumbnailURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getThumbnailFileURL(image["GUID"]);
            } else {
                bindedImage["OriginalURL"] = "";
                bindedImage["ThumbnailURL"] = "";
            }
            return bindedImage;
        }
        return null;
    }
    add(image) {
        image["Created"] = utilities.nowInSeconds();
        if (Image.valid(image)) {
            image["GUID"] = ImageFilesRepository.storeImageData("", image["ImageData"]);
            delete image["ImageData"];
            return super.add(image);
        }
        return null;
    }
    update(image) {
        image["Created"] = utilities.nowInSeconds();
        if (Image.valid(image)) {
            let foundImage = super.get(image.Id);
            if (foundImage != null) {
                image["GUID"] = ImageFilesRepository.storeImageData(image["GUID"], image["ImageData"]);
                delete image["ImageData"];
                return super.update(image);
            }
        }
        return false;
    }
    remove(id){
        let foundImage = super.get(id);
        if (foundImage) {
            ImageFilesRepository.removeImageFile(foundImage["GUID"]);
            return super.remove(id);
        }
        return false;
    }
}