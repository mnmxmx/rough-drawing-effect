class Controls{
  constructor(webgl){
    this.webgl = webgl;

    this.colorTex = this.webgl.colorTex;
    this.uColorArray = this.colorTex.material.uniforms.uColorArray;

    this.props = {
      pallete: this.colorTex._colorPallete,
      edge: this.webgl.edgeColor,
      bg: this.webgl.bgColor,
      objType: this.colorTex.objTypeName[0]

    };

    this.init();
  }

  init(){
    this.gui = new dat.GUI({width: 300});

    this.gui_objColor = this.gui.addFolder('obj color');
    this.gui_objColor.open();

    this.gui_objColor.addColor(this.props.pallete, 0).name("obj color 1").onFinishChange(this.colorFunc1.bind(this));
    this.gui_objColor.addColor(this.props.pallete, 1).name("obj color 2").onFinishChange(this.colorFunc2.bind(this));
    this.gui_objColor.addColor(this.props.pallete, 2).name("obj color 3").onFinishChange(this.colorFunc3.bind(this));
    this.gui_objColor.addColor(this.props.pallete, 3).name("obj color 4").onFinishChange(this.colorFunc4.bind(this));

    this.gui.addColor(this.props, "edge").name("edge color").onFinishChange(this.colorFunc_edge.bind(this));
    this.gui.addColor(this.props, "bg").name("bg color").onFinishChange(this.colorFunc_bg.bind(this));

    this.gui.add(this.props, "objType", this.colorTex.objTypeName).name("obj type").onFinishChange(this.objTypeFunc.bind(this));
  }

  colorFunc1(value){
    var color = new THREE.Color(value);
    this.uColorArray.value[0] = color;
  }

  colorFunc2(value){
    var color = new THREE.Color(value);
    this.uColorArray.value[1] = color;
  }

  colorFunc3(value){
    var color = new THREE.Color(value);
    this.uColorArray.value[2] = color;
  }

  colorFunc4(value){
    var color = new THREE.Color(value);
    this.uColorArray.value[3] = color;
  }

  colorFunc_edge(value){
    var color = new THREE.Color(value);
    this.webgl.uniforms.uEdgeColor.value = color;
  }

  colorFunc_bg(value){
    var color = new THREE.Color(value);
    this.webgl.uniforms.uBgColor.value = color;
  }

  objTypeFunc(value){
    for(var i = 0, len = this.colorTex.objTypeName.length; i < len; i++){
      if(value === this.colorTex.objTypeName[i]){
        break;
      }
    }

    this.colorTex.objNum = i;
  }
}