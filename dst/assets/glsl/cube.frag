#define GLSLIFY 1
varying vec3 vPosition;
varying vec3 vColor;

uniform vec2 resolution;

float bias;

mat2 rotationMatrix( float a ) {
  return mat2( cos( a ), sin( a ),
          -sin( a ), cos( a ) );
}

vec3 calcIrradiance_hemi(vec3 newNormal, vec3 lightPos, vec3 grd, vec3 sky){
  float dotNL = dot(newNormal, normalize(lightPos));
  float hemiDiffuseWeight = 0.5 * dotNL + 0.5;

  return mix(grd, sky, hemiDiffuseWeight);
}

vec3 calcIrradiance_dir(vec3 newNormal, vec3 lightPos, vec3 light){
  float dotNL = dot(newNormal, normalize(lightPos));

  return light * max(0.0, dotNL);
}

const float PI = 3.14159265358979323846264;

// hemisphere ground color
const vec3 hemiLight_g = vec3(256.0, 246.0, 191.0) / vec3(256.0);

// hemisphere sky color
const vec3 hemiLight_s_1 = vec3(0.9,0.8,0.6);
const vec3 hemiLight_s_2 = vec3(0.9,0.6,0.7);

// directional light color
const vec3 dirLight_1 = vec3(0.2, 0.2, 0.0);
const vec3 dirLight_2 = vec3(0.0, 0.2, 0.2);

const vec3 dirLightPos_1 = vec3(4, 6, 10);
const vec3 dirLightPos_2 = vec3(-4, -6, -10);

const vec3 hemiLightPos_1 = vec3(-100.0, -100.0, 100.0);
const vec3 hemiLightPos_2 = vec3(-100.0, 100.0, -100.0);

void main() {
  vec3 fdx = dFdx( vPosition );
  vec3 fdy = dFdy( vPosition );
  vec3 n = normalize(cross(fdx, fdy));

  vec3 hemiColor = vec3(0.0);
  hemiColor += calcIrradiance_hemi(n, hemiLightPos_1, hemiLight_g, hemiLight_s_1) * 0.56;
  hemiColor += calcIrradiance_hemi(n, hemiLightPos_2, hemiLight_g, hemiLight_s_2) * 0.56;
  
  vec3 dirColor = vec3(0.0);
  dirColor += calcIrradiance_dir(n, dirLightPos_1, dirLight_1);
  dirColor += calcIrradiance_dir(n, dirLightPos_2, dirLight_2);

  vec3 color = vColor * hemiColor;
  color += dirColor;

  gl_FragColor = vec4(color, 1.0);
}