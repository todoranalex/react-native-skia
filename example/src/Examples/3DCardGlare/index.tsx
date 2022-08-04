import {
  Canvas,
  RoundedRect,
  Shader,
  Skia,
  FractalNoise,
  Blend,
  SweepGradient,
  vec,
  LinearGradient,
  useImage,
} from "@shopify/react-native-skia";
import React from "react";
import { View, ViewStyle, Image } from "react-native";
import Animated from "react-native-reanimated";

const HEIGHT = 180;
const WIDTH = 278;

const canvasPadding = 40;

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

// class BottleGreenColorScheme : BaseLightColorScheme("Bottle Green") {
//   override val foregroundColor = Color(0, 0, 0)
//   override val ultraLightColor = Color(145, 209, 131)
//   override val extraLightColor = Color(115, 197, 99)
//   override val lightColor = Color(63, 181, 59)
//   override val midColor = Color(6, 139, 58)
//   override val darkColor = Color(11, 75, 38)
//   override val ultraDarkColor = Color(0, 14, 14)
// }

export const Card3DGlareView: React.FC<{
  width: number;
  height: number;
  style?: ViewStyle;
  rStyle?: any;
  rotateStyle?: any;
}> = React.memo(({ width, height, style, rStyle, rotateStyle }) => {
  const FractalNoiseShader = () => (
    <FractalNoise freqX={0.45} freqY={0.45} octaves={4} />
  );
  const white = Skia.Color("#4b4641");
  const black = Skia.Color("#0f0a05");
  const MetalShader = () => (
    <Shader source={metalSource}>
      <FractalNoiseShader />
    </Shader>
  );
  const DuotoneShader = () => (
    <Shader
      source={duotoneSource}
      uniforms={{
        colorLight: [...white],
        colorDark: [...black],
        alpha: 1,
      }}
    >
      {/* <FractalNoiseShader /> */}
      <MetalShader />
    </Shader>
  );

  const LinearGradientView = () => {
    return (
      <LinearGradient
        colors={["#FFFFFF", "rgba(255,255,255,0)"]}
        start={vec(0, 0)}
        end={vec(width, height)}
      />
    );
  };

  const SweepGradientView = () => {
    const white = "rgb(255, 255, 255)";
    const black = "rgb(187,188,188)";

    // const positions = [0x0f,
    //   1/12f, 2/12f, 3/12f,
    //   4/12f, 5/12f, 6/12f,
    //   7/12f, 8/12f, 9/12f,
    //   10/12f, 11/12f, 1.0f]
    const colors = [
      white, // the first value is for 3 pm, the sweep starts here
      black, // 4
      white, // 5
      white, // 6
      white, // 7
      black, // 8
      white, // 9
      black, // 10
      white, // 11
      white, // 12
      white, // 1 constant color from 1pm to 2pm
      black, // 2
      white, // the last value also is at 3 pm, the sweep ends here
    ];
    return (
      <SweepGradient
        c={vec((width + canvasPadding) / 2, (height + canvasPadding) / 2)}
        colors={colors}
      />
    );
  };

  return (
    <Animated.View
      style={[
        {
          ...style,
          backgroundColor: "transparent",
        },
        rStyle,
        rotateStyle,
      ]}
    >
      <Canvas
        style={{ width: width + canvasPadding, height: height + canvasPadding }}
      >
        <RoundedRect
          x={canvasPadding / 2}
          y={canvasPadding / 2}
          width={width}
          height={height}
          r={20}
        >
          <Blend mode={"overlay"}>
            <LinearGradientView />
            <DuotoneShader />
          </Blend>
        </RoundedRect>
      </Canvas>
      <Image
        source={{
          uri: "https://blackrockconstruction.uk/wp-content/uploads/2019/04/Asset-1.png",
        }}
        resizeMode="contain"
        style={{
          top: height / 3.5,
          position: "absolute",
          height: height / 1.5,
          width: width / 1.5,
          // bottom: width / 2,
          alignSelf: "center",
        }}
      />
    </Animated.View>
  );
});

const Card3DGlare = () => {
  return (
    <View
      style={{ flex: 1, backgroundColor: "black", justifyContent: "center" }}
    >
      <Card3DGlareView height={HEIGHT} width={WIDTH} />
    </View>
  );
};

export default Card3DGlare;
