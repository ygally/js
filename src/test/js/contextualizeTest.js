var contextualize = require('../../main/js/contextualize');
var test = require('./test');
var data = {
	   dir: "root/test",
	   file: "yg.nfo",
	   simpleCar: "Bentley",
	   carTwo: "Ferrari",
	   op1: 4,
	   strOp2: "8"
	 };
	 
function square(n) {
	   return n*n;
}
var defs = [
  {name: "filepath", text: "{{dir}}/{{file}}"},
  {name: "double", text: "{{op1}} + {{op1}} = {{strOp2}}"},
  {name: "str", req: "simpleCar"},
  {name: "required", req: ["carOne", "carTwo"]},
  {name: "num", req: "op1", type: 'text'},
  {name: "square", req: "strOp2", type: 'int', fmt: square}
];

test("tpl txt fmt", a => {
	   var R = contextualize(data).translate(defs);
    a.equals(R.filepath, "root/test/yg.nfo",
    	  "res should be the en path");
});

test("twice op1 fmt", a => {
	   var R = contextualize(data).translate(defs);
    a.equals(R.double, "4 + 4 = 8",
    	  "doudle should show 4+4 op");
});

test("old required car", a => {
	   var R = contextualize(data).translate(defs);
    a.equals(R.str, "Bentley",
    	  "simple car should be Bentley");
});

test("old double required car", a => {
	   var R = contextualize(data).translate(defs);
    a.equals(R.required, "Ferrari",
    	  "car should have fell to Ferrari");
});

test("number in str", a => {
	   var R = contextualize(data).translate(defs);
    a.equals(R.num, "4",
    	  "number in text format should result in string");
});

test("string nb into nb", a => {
	   var R = contextualize(data).translate(defs);
    a.equals(R.square, 64,
    	  "should get nb 8x8 product");
});

test("single definition", a => {
	   var rabbit = contextualize({
	   	    vegetables: 'salad',
	   	    roots: 'carrot'
	   	}).translate({
	   		   name: 'food',
	   		   text: '{{roots}}&{{vegetables}}'
	   	});
    a.equals(rabbit.food, 'carrot&salad',
    	  "rabbit food is carrot&salad");
});