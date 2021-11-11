#ifdef GL_ES
precision highp float;
#endif

uniform vec3 iResolution; // viewport resolution (in pixels)
uniform float iTime; // shader playback time (in seconds)

vec2 hash2(vec2 p ) {
   return fract(sin(vec2(dot(p, vec2(123.4, 748.6)), dot(p, vec2(547.3, 659.3))))*5232.85324);   
}
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(43.232, 75.876)))*4526.3257);   
}

//Based off of iq's described here: http://www.iquilezles.org/www/articles/voronoilin
float voronoi(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float md = 5.0;
    vec2 m = vec2(0.0);
    for (int i = -1;i<=1;i++) {
        for (int j = -1;j<=1;j++) {
            vec2 g = vec2(i, j);
            vec2 o = hash2(n+g);
            o = 0.5+0.5*sin(iTime+5.038*o);
            vec2 r = g + o - f;
            float d = dot(r, r);
            if (d<md) {
              md = d;
              m = n+g+o;
            }
        }
    }
    return md;
}

float ov(vec2 p) {
    float v = 0.0;
    float a = 0.4;
    for (int i = 0;i<3;i++) {
        v+= voronoi(p)*a;
        p*=2.0;
        a*=0.5;
    }
    return v;
}

void main()
{
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    // vec4 a = vec4(0.2, 0.4, 1.0, 0.5); //51, 102, 255 azzurrino
    // vec4 b = vec4(0.85, 0.9, 1.0, 0.5); // 216, 229, 255 bianco panna

    vec4 a = vec4(0.196, 0.270, 0.588, 0.9); //50, 69, 150 blu
    vec4 b = vec4(0.596, 0.682, 0.901, 0.5); // 152, 174, 230 azzurrino
	gl_FragColor = vec4(mix(a, b, smoothstep(0.0, 0.8, ov(uv*5.0))));
    
}