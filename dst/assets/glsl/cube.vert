#define GLSLIFY 1
attribute float aNum;
// attribute float aColorNum;

uniform sampler2D posMap;
uniform sampler2D velMap;
uniform float uSize;
uniform float uTick;
uniform float uScale1;
uniform vec3 uScale2;
uniform vec3 uColorArray[4];

varying vec3 vPosition;
varying vec3 vColor;

// mat4 rotationMatrix(vec3 axis, float angle) {

//  axis = normalize(axis);
//  float s = sin(angle);
//  float c = cos(angle);
//  float oc = 1.0 - c;

//  return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
//        oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,
//        oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0,
//        0.0, 0.0, 0.0, 1.0);
// }

float parabola( float x) {
  return 4.0 * (1.0 - x) * x;
}

mat2 calcRotate2D(float _deg){
  float _sin = sin(_deg);
  float _cos = cos(_deg);
  return mat2(_cos, _sin, -_sin, _cos);
}

mat3 calcLookAtMatrix(vec3 vector, float roll) {
  vec3 rr = vec3(sin(roll), cos(roll), 0.0);
  vec3 ww = normalize(vector);
  vec3 uu = normalize(cross(ww, rr));
  vec3 vv = normalize(cross(uu, ww));

  return mat3(uu, ww, vv);
}

void main() {
  float time = uTick * 0.5;
  vec2 posUv;
  posUv.x = mod(aNum + 0.5, uSize);
  posUv.y = float((aNum + 0.5) / uSize);
  posUv /= vec2(uSize);
  vec4 cubePosition = texture2D( posMap, posUv );
  vec4 cubeVelocity = texture2D( velMap, posUv );
  float alpha = cubeVelocity.a / 100.0;
  float scale = 0.025 * parabola( alpha);

  vec3 pos = position;
  pos.zx = calcRotate2D(time * 1.6) * pos.zx;

  mat4 localRotationMat = mat4( calcLookAtMatrix( cubeVelocity.xyz, 0.0 ) );

  vec3 modifiedVertex =  (localRotationMat * vec4( pos * scale * (vec3(1.0))  * uScale2 * uScale1, 1.0 ) ).xyz;
  vec3 modifiedPosition = modifiedVertex + cubePosition.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( modifiedPosition, 1.0 );
  vPosition = modifiedPosition;

  vColor = uColorArray[int(mod(aNum, 4.0))];
}