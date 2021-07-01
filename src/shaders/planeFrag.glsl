#include <common>
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 color;
uniform vec4 iMouse;
struct PointLight {
  vec3 position;
  vec3 color;
};
uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
    // color=color*50.0;

    vec2 uv =  (4.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
    float mouseRatio = smoothstep(80.0, 10.0, length(iMouse.xy - fragCoord.xy));
  // Lights
  // vec4 addedLights = vec4(0.1, 0.1, 0.1, 1.0);
  // for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
  //   vec3 adjustedLight = pointLights[l].position + cameraPosition;
  //   vec2 lightDirection = normalize(fragCoord - adjustedLight.xy);
  //   addedLights.rgb += clamp(lightDirection, 0.0, 1.0) * pointLights[l].color;
  // }


    for(float i = 1.0; i < 10.0; i++){
        uv.x += (0.6+(abs(mouseRatio)/5.0)) / (i) * cos(i * (2.5) * uv.y + iTime);
        uv.y += (0.9+(abs(mouseRatio)*3.0)) / (i) * cos(i * 1.3 * uv.x + iTime);
    }
    vec4 fragFinal=vec4(color*abs(cos(iTime-(uv.y-uv.x))),1.0);
    
    fragColor = fragFinal;
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}


