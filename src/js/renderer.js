function renderer(){

const electron = require('electron')
const {dialog } = require('electron').remote;

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

const path = require('path');


db.defaults({ files: [], count: 0 })
  .write()

let Notify = require('notifyjs');
const fs = require('fs');

const SimpleMDE = require("simplemde");


var activeFile ="";

var simplemde = new SimpleMDE({ element: document.getElementById("text-area") });
 
electron.ipcRenderer.on('new-file', (event, arg) => {
   var filename = openSaveDialog("");
   if(filename !== null && filename!==""){
    saveFile(filename);
   }

});

electron.ipcRenderer.on('open-file', (event, arg) => {
     var filename = openSelectFileDialog();
     openFile(filename);
  
});


electron.ipcRenderer.on('clear-recents', (event, arg) => {
    removeAllRecentFiles();
    getRecentFiles();
  
});

startUpFunctions();

function startUpFunctions(){
    showCreateView();
    getRecentFiles();
}

function openFile(filename){
    setActiveFile(filename);
    setCurrentFileName();
    writeFileToTextArea();
    hideCreateView();
}

function saveFile(filename){
    setActiveFile(filename);
    setCurrentFileName();
    hideCreateView();
    showAlertBar();
}

function selectFile(filename){
    setActiveFile(filename);
    setCurrentFileName();
    hideCreateView();
}

function cancelFileEdit(){
    setActiveFile(undefined);
    simplemde.value("");
    showCreateView();
}

function editFile(){
    showCreateView();
    fileNameInput.val(getFileName(getActiveFile()));
}

function createFile(fname){
    var content=simplemde.value();
    writeToFile(content, fname).then(function(){
        saveFile(fname);
    });
}

function showAlertBar(){
    alertBar.show();
    clearTimeout(timeOutId);
    timeOutId = setTimeout(function(){
        alertBar.fadeOut();
    }, 3000);
}

cancelButton.on("click",function(){
    cancelFileEdit();
    return false;
});

saveButton.on("click",function(){
    var fname = "";
    var content=simplemde.value();
    if(isFileActive()){
        fname = getActiveFile();
    }else{
        fname = openSaveDialog("");
    }
    createFile(fname);
    return false;
});


quickSaveButton.on("click",function(){
    var filename = fileNameInput.val();
    if(filename !== "" ){
        if(isFileActive()){
            renameFile(filename);
        }else{
            var path = openSaveDialog(filename);
            selectFile(path);
        }
    }
    return false;
});


headerTitle.dblclick(function() {
    editFile();
    return false;
});

function renameFile(filename){
    var currentPath = getActiveFile();
    var basePath = path.dirname(currentPath);
    var newPath = path.join(basePath, filename);
    createFile(newPath);
}

function openSaveDialog(df){
    var filename= dialog.showSaveDialog(
        { defaultPath: df, properties: ['selectFile'] });
    setActiveFile(filename);
    return filename;
}

function openSelectFileDialog(){
   var files = dialog.showOpenDialog(
       { properties: ['openFile'] });
    var filename = files[0];
    return filename;
}

function writeFileToTextArea(){
    var currentFile = getActiveFile();
    if(validateFile(currentFile)){
        var mdData = fs.readFileSync(getActiveFile()).toString();
        simplemde.value(mdData);
    }
}


async function writeToFile(text, filename){
    if(filename!== undefined && validateFile(filename)){
        fs.writeFile(filename, text, function(err) {
            if(err) {
                //return console.log(err);
            }
            return true;
        }); 
    }
}

function getFileName(fullPath){
    if(fullPath !== undefined){
        return fullPath.replace(/^.*[\\\/]/, '');
    }
}

function setActiveFile(filename){
    activeFile = filename;
    var name = getFileName(filename);
    if(filename !== undefined){
        addRecentFile(name, filename)
    }
}

function isFileActive(){
    if(activeFile=== undefined || activeFile ===""){
        return false;
    }
    return true;
}

function getActiveFile(){
    return activeFile;
}

function setCurrentFileName(){
    var filename = getActiveFile();
    headerTitle.text(getFileName(filename));
}

function successMessage(msg){
    var myNotification = new Notify('Yo dawg!', {
        body: 'This is an awesome notification',
    });
    myNotification.show();
}

function failureMessage(){
    jQuery.notify("Hello World");
}

function hideCreateView(){
    createFileView.hide();
    headerTitle.show();
}

function showCreateView(){
    createFileView.show();
    headerTitle.hide();
}

function validateFile(filename){
    var ext = path.extname(filename);
    if(ext === ".md"){
        return true;
    }
    return false;
}

function addRecentFile(fileName, filePath){
    if(!recentFileExists(fileName)){
        db.get('files')
        .push({ name: fileName, path: filePath})
        .write()
    }
}

function recentFileExists(recentFileName){
    var count = db.get('files')
        .find({ name: recentFileName })
        .size()
        .value();
    if(count > 0 ){
        return true;
    }
    return false;
}

function getRecentFiles(){
    var files = db.get('files').value("files");
    var htmlView = createRecentFilesView(files);
    recentFiles.empty();
    recentFiles.append(htmlView);
}

function createRecentFilesView(data){
    var template = `<li>
        <a class="recent-file" data-locale="{location}" href="javascript:void(0)">{name}</a>
    </li>`;
    var output =`<li class="sidebar-brand">
        <a href="javascript:void(0);">Recent Files
        </a></li>`;
    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        output += addDataTotemplate(template, shortenText(obj.name), obj.path );
    }
    return output;
}

function addDataTotemplate(temp, name, locale){
    temp = temp.replace("{name}", name);
    temp = temp.replace("{location}",locale);
    return temp;
}

function removeAllRecentFiles(){
    db.get('files')
  .remove().write();
}

function shortenText(string){
    if(string.length > 15) {
        string = string.substring(0,15)+"...";
    }
    return string;
}


};