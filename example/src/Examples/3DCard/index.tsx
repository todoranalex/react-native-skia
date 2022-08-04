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
import { View } from "react-native";
import {
  Extrapolate,
  interpolate,
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Card3DGlareView } from "../3DCardGlare";

type BackgroundGradientProps = {
  width: number;
  height: number;
};
const HEIGHT = 180;
const WIDTH = 278;

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
          alignSelf: "center",
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

  const animatedSensor = useAnimatedSensor(SensorType.ROTATION, {
    interval: 100,
  });

  const gyroscopeSensor = useAnimatedSensor(SensorType.GYROSCOPE, {
    interval: 100,
  });

  const gyroscope = useAnimatedStyle(() => {
    const { x, y, z } = gyroscopeSensor.sensor.value;
    return {
      transform: [
        {
          translateY: y,
        },
        {
          translateX: x,
        },
      ],
    };
  });

  const rotate = useAnimatedStyle(() => {
    const rotateXvalue = `${rotateX.value}deg`;
    const rotateYvalue = `${rotateY.value}deg`;
    const { pitch, yaw } = animatedSensor.sensor.value;

    let yawValue =
      30 * (yaw < 0 ? 2.5 * Number(yaw.toFixed(2)) : Number(yaw.toFixed(2)));
    let pitchValue = 36 * pitch.toFixed(2);

    return {
      transform: [
        {
          translateY: interpolate(
            yawValue,
            [-45, 45],
            [-5, 5],
            Extrapolate.CLAMP
          ),
        },
        {
          translateX: interpolate(
            pitchValue,
            [-45, 45],
            [-5, 5],
            Extrapolate.CLAMP
          ),
        },
        {
          perspective: 300,
        },
        { rotateX: rotateXvalue },
        { rotateY: rotateYvalue },
      ],
    };
  });
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
        <Card3DGlareView
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          rotateStyle={rotate}
          style={{
            alignSelf: "center",

            backgroundColor: "black",
            position: "absolute",
            borderRadius: 20,
            zIndex: 300,
          }}
          // rStyle={rStyle}
        />
      </GestureDetector>
    </View>
  );
};

export default Card3D;
