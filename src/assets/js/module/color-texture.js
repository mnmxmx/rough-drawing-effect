class ColorTex{
  constructor(webgl){
    this.webgl = webgl;
    this.size = this.webgl.size;

    this._colorPallete = [
      0xfaee69,
      0xf2397a,
      0xffffff,
      0x00c2ff
    ];

    this.colorPallete = [];

    for(let i = 0; i <this._colorPallete.length; i++){
      this.colorPallete[i] = new THREE.Color(this._colorPallete[i]);
    }

    this.objType = [
      new THREE.CylinderBufferGeometry( 15, 15, 5, 6 ),
      new THREE.CircleBufferGeometry( 20, 32 ),
      new THREE.TorusBufferGeometry(30, 4, 5, 3),
      new THREE.ConeBufferGeometry( 14, 40, 5 ),
      new THREE.BoxBufferGeometry(14, 40, 14)
    ];

    this.objTypeName = [
      "hexagon", "circle", "triangle", "cone", "rectangular"
    ];

    this.objNum = 0;
    this.init();
  }

  init(){
    this.width = this.webgl.width;
    this.height = this.webgl.height;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, .01, 10000 );
    this.scene.add( this.camera );
    this.camera.position.set(-2, 6, 2);
    this.camera.lookAt(this.scene.position);

    var renderTargetParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    };

    this.fbo = new THREE.WebGLRenderTarget( this.width * 1.5, this.height * 1.5, renderTargetParameters );
    this.fbo.texture.format = THREE.RGBAFormat;

    // edge
    var renderTargetParameters_edge = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    };

    this.fbo_edge = new THREE.WebGLRenderTarget( this.width * 1.2, this.height * 1.2, renderTargetParameters_edge );
    this.fbo_edge.texture.format = THREE.RGBAFormat;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.orbitControls = new THREE.OrbitControls( this.camera, this.webgl.renderer.domElement );

    this.sim = new Simulation(this.webgl, this.size);

    for(let i = 0; i < this.objType.length; i++){
      var originalG = this.objType[i];
      var face = this.createObj(originalG);
      var edge = this.createEdge(originalG);

      this.objType[i] = {
        face: face.face,
        edge: edge,
        edgeFace: face.edgeFace
      }
    }

  };


  createObj(originalG){
    var geometry = new THREE.InstancedBufferGeometry();
    var vertices = originalG.attributes.position.clone();

    geometry.addAttribute("position", vertices);

    var normals = originalG.attributes.normal.clone();
    geometry.addAttribute("normal", normals);

      // uv
    var uvs = originalG.attributes.uv.clone();
    geometry.addAttribute("uv", uvs);

      // index
    var indices = originalG.index.clone();
    geometry.setIndex(indices);


    geometry.maxInstancedCount = this.sim.size * this.sim.size;

    var nums = new THREE.InstancedBufferAttribute(new Float32Array(this.sim.size * this.sim.size * 1), 1, 1);
    var numRatios = new THREE.InstancedBufferAttribute(new Float32Array(this.sim.size * this.sim.size * 1), 1, 1);

    // var randoms = new THREE.InstancedBufferAttribute(new Float32Array(this.sim.size * this.sim.size * 1), 1, 1);
    // var colors = new THREE.InstancedBufferAttribute(new Float32Array(this.sim.size * this.sim.size * 1), 1, 1);

    for(var i = 0; i < nums.count; i++){
      nums.setX(i, i);
      numRatios.setX(i, i / (nums.count - 1));
    }


    geometry.addAttribute("aNum", nums);
    geometry.addAttribute("aNumRatio", numRatios);

    var scale = {
      x: 1, 
      y: 1,
      z: 1
    }

    this.material = new THREE.ShaderMaterial( {
      uniforms: {
        posMap: { type: "t", value: this.sim.gpuCompute.getCurrentRenderTarget(this.sim.pos).texture },
        velMap: { type: "t", value: this.sim.gpuCompute.getCurrentRenderTarget(this.sim.vel).texture },
        uSize: { type: "f", value: this.sim.size },
        uTick: { type: 'f', value: 0 },
        uScale2: { type: 'v3', value: new THREE.Vector3(scale.x, scale.y, scale.z) },
        uScale1: { type: 'f', value: 0.7 },
        uColorArray: {type: "v3v", value: this.colorPallete}
      },

      vertexShader: this.webgl.vertShader[1],
      fragmentShader: this.webgl.fragShader[4],
      side: THREE.DoubleSide,
      flatShading: true,
      transparent: true,

    } );

    this.material_edge = new THREE.ShaderMaterial( {
      uniforms: {
        posMap: { type: "t", value: this.sim.gpuCompute.getCurrentRenderTarget(this.sim.pos).texture },
        velMap: { type: "t", value: this.sim.gpuCompute.getCurrentRenderTarget(this.sim.vel).texture },
        uSize: { type: "f", value: this.sim.size },

        uTick: { type: 'f', value: 0 },
        uScale2: { type: 'v3', value: new THREE.Vector3(scale.x, scale.y, scale.z) },
        uScale1: { type: 'f', value: 0.7 },
      },

      vertexShader: this.webgl.vertShader[1],
      fragmentShader: this.webgl.fragShader[5]
    } );


    this.material_edgeFace = new THREE.ShaderMaterial( {
      uniforms: {
        posMap: { type: "t", value: this.sim.gpuCompute.getCurrentRenderTarget(this.sim.pos).texture },
        velMap: { type: "t", value: this.sim.gpuCompute.getCurrentRenderTarget(this.sim.vel).texture },
        uSize: { type: "f", value: this.sim.size },

        uTick: { type: 'f', value: 0 },
        uScale2: { type: 'v3', value: new THREE.Vector3(scale.x * 0.99, scale.y * 0.99, scale.z * 0.99) },
        uScale1: { type: 'f', value: 0.7 }
      },

      vertexShader: this.webgl.vertShader[1],
      fragmentShader: this.webgl.fragShader[6],
      side: THREE.DoubleSide,

    } );



    const mesh = new THREE.Mesh( geometry, this.material );
    const mesh_edgeFace = new THREE.Mesh(geometry, this.material_edgeFace);

    mesh.visible = false;
    mesh_edgeFace.visible = false;


    this.group.add( mesh );
    this.group.add( mesh_edgeFace );

    return {face: mesh, edgeFace: mesh_edgeFace};
  };

  createEdge(originalG){
    // var originalG = new THREE.OctahedronBufferGeometry(1, 0);

    this.edgesOriginalG = new THREE.EdgesGeometry(originalG);

    var geometry = new THREE.InstancedBufferGeometry();
    var vertices = this.edgesOriginalG.attributes.position.clone();

    geometry.addAttribute("position", vertices);

    // var normals = this.edgesOriginalG.attributes.normal.clone();
    // geometry.addAttribute("normal", normals);

    //   // uv
    // var uvs = this.edgesOriginalG.attributes.uv.clone();
    // geometry.addAttribute("uv", uvs);

      // index
    // var indices = this.edgesOriginalG.index.clone();
    // geometry.setIndex(indices);


    geometry.maxInstancedCount = this.sim.size * this.sim.size;

    var nums = new THREE.InstancedBufferAttribute(new Float32Array(this.sim.size * this.sim.size * 1), 1, 1);
    var numRatios = new THREE.InstancedBufferAttribute(new Float32Array(this.sim.size * this.sim.size * 1), 1, 1);

    // var randoms = new THREE.InstancedBufferAttribute(new Float32Array(this.sim.size * this.sim.size * 1), 1, 1);

    for(var i = 0; i < nums.count; i++){
      nums.setX(i, i);
      numRatios.setX(i, i / (nums.count - 1));
    }


    geometry.addAttribute("aNum", nums);
    geometry.addAttribute("aNumRatio", numRatios);


    const mesh_edge = new THREE.LineSegments(geometry, this.material_edge);

    this.group.add( mesh_edge );
    mesh_edge.visible = false;

    return mesh_edge;
  }


  render(time, delta){
    var sin = (Math.sin(time) * 0.5 + 0.5) * 0.5;

    this.group.rotation.x += delta * 0.1;
    this.group.rotation.y -= delta * 0.08;


    this.sim.velUniforms.timer.value = time;
    this.sim.velUniforms.delta.value = delta;

    this.sim.gpuCompute.compute();

    this.material.uniforms.posMap.value = this.sim.gpuCompute.getCurrentRenderTarget(this.sim.pos).texture;
    this.material.uniforms.velMap.value = this.sim.gpuCompute.getCurrentRenderTarget(this.sim.vel).texture;

    this.material_edge.uniforms.posMap.value = this.sim.gpuCompute.getCurrentRenderTarget(this.sim.pos).texture;
    this.material_edge.uniforms.velMap.value = this.sim.gpuCompute.getCurrentRenderTarget(this.sim.vel).texture;

    // timer
    this.material.uniforms.uTick.value = this.material_edge.uniforms.uTick.value = this.material_edgeFace.uniforms.uTick.value = time;

    this.objType[this.objNum].edgeFace.visible = true;
    this.objType[this.objNum].edge.visible = true;
    this.objType[this.objNum].face.visible = false;
    this.webgl.renderer.render( this.scene, this.camera, this.fbo_edge);

    this.objType[this.objNum].edgeFace.visible = false;
    this.objType[this.objNum].edge.visible = false;
    this.objType[this.objNum].face.visible = true;
    this.webgl.renderer.render( this.scene, this.camera, this.fbo);

    this.objType[this.objNum].edgeFace.visible = false;
    this.objType[this.objNum].edge.visible = false;
    this.objType[this.objNum].face.visible = false;
  };

}