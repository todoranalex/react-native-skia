import {
  BlurMask,
  Canvas,
  RoundedRect,
  SweepGradient,
  useSharedValueEffect,
  useValue,
  vec,
} from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Gesture, GestureDetector } from "react-native-gesture-handler";

type BackgroundGradientProps = {
  width: number;
  height: number;
};
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEIGHT = 256;
const WIDTH = SCREEN_WIDTH * 0.9;

const CARD_HEIGHT = HEIGHT - 5;
const CARD_WIDTH = WIDTH - 5;

const canvasPadding = 40;

const BackgroundGradient: React.FC<BackgroundGradientProps> = React.memo(
  ({ width, height }) => {
    const rValue = useSharedValue(0);
    const skValue = useValue(0);

    useEffect(() => {
      rValue.value = withRepeat(withTiming(10, { duration: 2000 }), -1, true);
    }, [rValue]);

    useSharedValueEffect(() => {
      skValue.current = rValue.value;
    }, rValue);

    return (
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
          color={"white"}
          r={20}
        >
          <SweepGradient
            c={vec((width + canvasPadding) / 2, (height + canvasPadding) / 2)}
            colors={["cyan", "magenta", "yellow", "cyan"]}
          />
          <BlurMask blur={skValue} style={"solid"} />
        </RoundedRect>
      </Canvas>
    );
  }
);

const Card3D = () => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const gesture = Gesture.Pan()
    .onBegin((event) => {
      rotateX.value = withTiming(
        interpolate(event.y, [0, CARD_HEIGHT], [10, -10], Extrapolate.CLAMP)
      );
      rotateY.value = withTiming(
        interpolate(event.x, [0, CARD_WIDTH], [-10, 10], Extrapolate.CLAMP)
      );
    })
    .onUpdate((event) => {
      // topLeft (10deg, -10deg)
      // topRight (10deg, 10deg)
      // bottomRight (-10deg, 10deg)
      // bottomLeft (-10deg, -10deg)

      rotateX.value = interpolate(
        event.y,
        [0, CARD_HEIGHT],
        [10, -10],
        Extrapolate.CLAMP
      );
      rotateY.value = interpolate(
        event.x,
        [0, CARD_WIDTH],
        [-10, 10],
        Extrapolate.CLAMP
      );
    })
    .onFinalize(() => {
      rotateX.value = withTiming(0);
      rotateY.value = withTiming(0);
    });

  const rStyle = useAnimatedStyle(() => {
    const rotateXvalue = `${rotateX.value}deg`;
    const rotateYvalue = `${rotateY.value}deg`;

    return {
      transform: [
        {
          perspective: 300,
        },
        { rotateX: rotateXvalue },
        { rotateY: rotateYvalue },
      ],
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "black",
      }}
    >
      <BackgroundGradient width={WIDTH} height={HEIGHT} />

      <GestureDetector gesture={gesture}>
        <>
          <Animated.View
            style={[
              {
                alignSelf: "center",
                height: CARD_HEIGHT,
                width: CARD_WIDTH,
                backgroundColor: "black",
                position: "absolute",
                borderRadius: 20,
                zIndex: 300,
              },
              rStyle,
            ]}
          >
            <View
              style={{
                position: "absolute",
                bottom: "10%",
                left: "10%",
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  height: 50,
                  aspectRatio: 1,
                  borderRadius: 25,
                  backgroundColor: "#272F46",
                }}
              />
              <View
                style={{
                  flexDirection: "column",
                  marginLeft: 10,
                  justifyContent: "space-around",
                }}
              >
                <View
                  style={{
                    height: 20,
                    width: 80,
                    borderRadius: 25,
                    backgroundColor: "#272F46",
                  }}
                />
                <View
                  style={{
                    height: 20,
                    width: 80,
                    borderRadius: 25,
                    backgroundColor: "#272F46",
                  }}
                />
              </View>
            </View>
          </Animated.View>
        </>
      </GestureDetector>
    </View>
  );
};

export default Card3D;
