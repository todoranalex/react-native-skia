import {
  Canvas,
  RoundedRect,
  useValue,
  useSharedValueEffect,
  Color,
  Shader,
  Skia,
  FractalNoise,
  Blend,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEIGHT = 256;
const WIDTH = SCREEN_WIDTH * 0.9;

const CARD_HEIGHT = HEIGHT - 5;
const CARD_WIDTH = WIDTH - 5;

const duotoneSource = Skia.RuntimeEffect.Make(`
uniform shader shaderInput;
uniform vec4 colorLight;
uniform vec4 colorDark;
uniform float alpha;
          
half4 main(vec2 fragcoord) { 
  vec4 inputColor = shaderInput.eval(fragcoord);
  float luma = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
  vec4 duotone = mix(colorLight, colorDark, luma);
  return vec4(duotone.r * alpha, duotone.g * alpha, duotone.b * alpha, alpha);
}
`)!;

const metalSource = Skia.RuntimeEffect.Make(`
uniform shader shaderInput;

half4 main(vec2 fragcoord) { 
  vec4 inputColor = shaderInput.eval(vec2(0, fragcoord.y));
  // Compute the luma at the first pixel in this row
  float luma = dot(inputColor.rgb, vec3(0.299, 0.587, 0.114));
  // Apply modulation to stretch and shift the texture for the brushed metal look 
  float modulated = abs(cos((0.004 + 0.02 * luma) * (fragcoord.x + 200) + 0.26 * luma) 
      * sin((0.06 - 0.25 * luma) * (fragcoord.x + 85) + 0.75 * luma));
  // Map 0.0-1.0 range to inverse 0.15-0.3
  float modulated2 = 0.3 - modulated / 6.5;
  half4 result = half4(modulated2, modulated2, modulated2, 1.0);
  return result;
}`)!;

const Gradient: React.FC<{
  width: number;
  height: number;
}> = React.memo(({ width, height }) => {
  const colors: readonly [Color, Color, Color, Color] = [
    "cyan",
    "magenta",
    "yellow",
    "cyan",
  ];

  const canvasPadding = 40;
  const skValue = useValue<Color[]>([
    "red",
    "blue",
    "green",
    "gray",
    "white",
    "gray",
  ]);
  const rValue = useSharedValue<readonly [Color, Color, Color, Color]>(colors);
  // useEffect(() => {
  //   rValue.value = withRepeat(withTiming(10, { duration: 2000 }), -1, true);
  // }, [rValue]);

  useSharedValueEffect(() => {
    // skValue.current = rValue.value;
  }, rValue);

  const rotateZ = useSharedValue(0);
  const gesture = Gesture.Pan()

    .onBegin((event) => {})
    .onUpdate((event) => {
      const generateColor = () => {
        const randomColor = Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");
        return `#${randomColor}`;
      };

      rValue.value = [
        generateColor(),
        generateColor(),
        generateColor(),
        generateColor(),
      ];
      // console.log(event.y);
      // rotateZ.value = withTiming(
      //   interpolate(event.y, [0, CARD_HEIGHT], [50, 50], Extrapolate.CLAMP)
      // );
    })
    .onFinalize((event) => {});

  const FractalNoiseShader = () => (
    <FractalNoise seed={0x0f} freqX={0.45} freqY={0.45} octaves={4} />
  );

  const MetalShader = () => (
    <Shader source={metalSource}>
      <FractalNoiseShader />
    </Shader>
  );

  const DuotoneShader = () => (
    <Shader
      source={duotoneSource}
      uniforms={{
        colorLight: [0.0, 0.0, 0.0, 0.0],
        colorDark: [1.0, 1.0, 1.0, 0.0],
        alpha: 1,
      }}
    >
      {/* <FractalNoiseShader /> */}
      <MetalShader />
    </Shader>
  );

  return (
    <GestureDetector gesture={gesture}>
      <Canvas
        style={{
          width: width + canvasPadding,
          height: height + canvasPadding,
        }}
      >
        <RoundedRect
          x={canvasPadding / 2}
          y={canvasPadding / 2}
          width={width}
          height={height}
          r={20}
        >
          <DuotoneShader />
        </RoundedRect>
      </Canvas>
    </GestureDetector>
  );
});

const Card3DGlare = () => {
  return (
    <>
      <Gradient height={HEIGHT} width={WIDTH} />
    </>
  );
};

export default Card3DGlare;
