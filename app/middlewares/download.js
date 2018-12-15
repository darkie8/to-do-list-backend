
const mongoose = require('mongoose')
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const path = require('path');
// model 
const IssueModel = mongoose.model('Issue_4')

let downloadIssueFiles = (req,res) => {

IssueModel.findOne({
    issueId: req.params.issueId
}).select(' -__v -_id')
.lean()
.exec((err, result) => {
    if(err) {
        logger.error('Failed To Retrieve User Data', 'uoloadingfilecontroller: uploadFiles()', 10)
        let apiResponse = response.generate(true, 'failed to upload', 501, 'error')
        res.send(apiResponse)
    }
    else {
        let filePath = path.join(__dirname,`../../uploads/${req.params.issueId}`) + `/${req.body.filePath}`
        res.sendFile(filePath);
    }
    
})

}
module.exports ={
    downloadIssueFiles: downloadIssueFiles
}