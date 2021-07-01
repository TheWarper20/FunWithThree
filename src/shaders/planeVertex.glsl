#if NUM_DIR_LIGHTS > 0
    struct DirectionalLight {
        vec3 direction;
        vec3 color;
        int shadow;
        float shadowBias;
        float shadowRadius;
        vec2 shadowMapSize;
     };
     uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
#endif
  varying vec3 color;
  void main() {
     float r = directionalLights[0].color.r;
     color = vec3(r,1.0,0.0);
     gl_Position = projectionMatrix * modelViewMatrix * vec4(position , 1.0);
  }
