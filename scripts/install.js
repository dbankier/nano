var fs = require("fs");
var path = require("path");

var root = path.join(__dirname,'..','..','..');
var alloy_path = path.join(root, 'app');
var lib_path = path.join(alloy_path, 'lib');
var dist_path = path.join(__dirname,'..', 'dist');

console.log(alloy_path);
function copyFileToPath(src,dest,name) {
  fs.writeFileSync(path.join(dest,name), fs.readFileSync(path.join(src,name)));
}
if (fs.existsSync(alloy_path)) {
  if(!fs.existsSync(lib_path)) {
    fs.mkdirSync(lib_path);
  }
  copyFileToPath(dist_path, lib_path, "nano.js");
  console.log("nano.js library file added to your project");
}

