


void mainImage( out vec4 fragColor, in vec2 fragCoord ){
    vec2 uv =  (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);
    float mouseRatio = smoothstep(120.0, 10.0, length(iMouse.xy - fragCoord.xy));

    for(float i = 1.0; i < 10.0; i++){
        uv.x += (0.6+(abs(mouseRatio/(iTime)))) / (i) * cos(i * (2.5) * uv.y + iTime);
        uv.y += (0.9+(abs(mouseRatio/0.5))) / (i) * cos(i * 1.3 * uv.x + iTime);
    }
    fragColor = vec4(vec3(0.05)*abs(cos(iTime-(uv.y-uv.x))),1.0);
}