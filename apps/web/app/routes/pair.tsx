import { useSearchParams } from "@remix-run/react";
import {
  Button,
  Card,
  PairingCode,
  Separator,
  Text,
  View,
  YStack,
} from "@syncstuff/ui";
import { useEffect } from "react";

export default function PairPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const name = searchParams.get("name");

  useEffect(() => {
    // Attempt to open the native app
    if (id) {
      const deepLink = `syncstuff://pair?id=${id}&name=${encodeURIComponent(name || "")}`;
      window.location.href = deepLink;
    }
  }, [id, name]);

  return (
    <View
      position="absolute"
      top={0}
      right={0}
      bottom={0}
      left={0}
      backgroundColor="$background"
      alignItems="center"
      justifyContent="center"
      padding="$4"
    >
      <Card elevate bordered padding="$4" maxWidth={400} width="100%">
        <YStack space="$6" alignItems="center">
          <Text fontSize="$8" fontWeight="bold" color="$primary">
            Pairing Request
          </Text>

          {id ? (
            <>
              <YStack alignItems="center" space="$2">
                <Text color="$colorSubtitle">You are pairing with device:</Text>
                <Text fontSize="$6" fontWeight="bold">
                  {name || "Unknown Device"}
                </Text>
                <Text fontSize="$1" color="$colorSubtitle" fontFamily="$mono">
                  {id}
                </Text>
              </YStack>

              <YStack space="$4" width="100%">
                <Text fontSize="$3" textAlign="center" color="$colorSubtitle">
                  If the app didn't open automatically, use the button below or
                  enter the code manually.
                </Text>

                <Button
                  theme="blue"
                  size="$4"
                  width="100%"
                  onPress={() => {
                    window.location.href = `syncstuff://pair?id=${id}&name=${encodeURIComponent(name || "")}`;
                  }}
                >
                  Open Syncstuff App
                </Button>

                <YStack space="$2">
                  <Text
                    fontSize="$2"
                    fontWeight="bold"
                    textAlign="center"
                    color="$colorSubtitle"
                  >
                    MANUAL PAIRING CODE
                  </Text>
                  <PairingCode code={id.substring(0, 6).toUpperCase()} />
                </YStack>
              </YStack>
            </>
          ) : (
            <Text color="$red10">
              Invalid pairing request. No device information found.
            </Text>
          )}

          <Separator width="100%" />

          <Button
            variant="outlined"
            onPress={() => (window.location.href = "/")}
          >
            Back to Home
          </Button>
        </YStack>
      </Card>
    </View>
  );
}
