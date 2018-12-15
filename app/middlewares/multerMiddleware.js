var multer = require('multer');
const time = require('../libs/timeLib');
const fse = require('fs-extra')
var storing = multer.diskStorage({
    destination:function(req,file,cb){
        try{
            console.log(req.query)
            let directoryName = `${time.getLocalTime().replace(/ |, |:/gi,'_')}_${req.query.reporter.replace(/ /gi, '_')}`
           let dirPath = `tempUploads/${directoryName}`
            fse.ensureDir(dirPath,err => {
               console.log('cant create directory')
           })
           req.dirPath = dirPath
            cb(null, dirPath);
        }
        catch(e){
            console.log('error');
            cb(e,null);
        }
    },
    filename:function(req,file,cb){
        cb(null, file.originalname);
    }
});

var upload = multer({storage:storing}).array("demo[]",5);

module.exports = {
    upload: upload
}
