var contextualize = require('../../main/js/contextualize.js');

//==========================
var data = {
   dir: "root/test",
   file: "yg.nfo",
   simple: "Bentley",
   op1: 4,
   res: 8
};
var defs = [
  {name: "res",
    text: "{{dir}}/{{file}}"},
  {name: "double",
    text: "{{op1}} + {{op1}} = {{res}}"},
  {name: "str",
    req: "simple"},
  {name: "required",
    req: ["chouette", "simple"]}
];
var R = contextualize(data)
    .translate(defs),
  S = JSON.stringify(R,'',4);
console.log(S);
