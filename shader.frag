#ifdef GL_ES
precision highp float;
#endif

uniform vec3 iResolution; // viewport resolution (in pixels)
uniform float iTime; // shader playback time (in seconds)

const vec3 COLOR = vec3(0.83, 0.83, 0.83); //lightgray
const vec3 BG = vec3(0.59, 0.71, 1.0); // (150,180,255)
const float ZOOM = 3.0;
const int OCTAVES = 4;
const float INTENSITY = 2.;

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9818,79.279)))*43758.5453123);
}

vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)), dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0 * fract(sin(st) * 43759.34517123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // smootstep
    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),
                     dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),
                     dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}


float fractal_brownian_motion(vec2 coord) {
	float value = 0.0;
	float scale = 0.5;
	for (int i = 0; i < 4; i++) {
		value += noise(coord) * scale;
		coord *= 2.0;
		scale *= 0.5;
	}
	return value + 0.2;
}

void main()
{
    vec2 st = gl_FragCoord.xy / iResolution.xy;
	st *= iResolution.xy  / iResolution.y;    
    vec2 pos = vec2(st * ZOOM);
	vec2 motion = vec2(fractal_brownian_motion(pos + vec2(iTime * -0.2, iTime * -0.2)));
	float final = fractal_brownian_motion(pos + motion) * INTENSITY;
    gl_FragColor = vec4(mix(BG, COLOR, final), 0.35);
}