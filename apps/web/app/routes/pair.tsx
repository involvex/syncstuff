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
      alignItems="center"
      backgroundColor="$background"
      bottom={0}
      justifyContent="center"
      left={0}
      padding="$4"
      position="absolute"
      right={0}
      top={0}
    >
      <Card bordered elevate maxWidth={400} padding="$4" width="100%">
        <YStack alignItems="center" space="$6">
          <Text color="$primary" fontSize="$8" fontWeight="bold">
            Pairing Request
          </Text>

          {id ? (
            <>
              <YStack alignItems="center" space="$2">
                <Text color="$colorSubtitle">You are pairing with device:</Text>
                <Text fontSize="$6" fontWeight="bold">
                  {name || "Unknown Device"}
                </Text>
                <Text color="$colorSubtitle" fontFamily="$mono" fontSize="$1">
                  {id}
                </Text>
              </YStack>

              <YStack space="$4" width="100%">
                <Text color="$colorSubtitle" fontSize="$3" textAlign="center">
                  If the app didn't open automatically, use the button below or
                  enter the code manually.
                </Text>

                <Button
                  onPress={() => {
                    window.location.href = `syncstuff://pair?id=${id}&name=${encodeURIComponent(name || "")}`;
                  }}
                  size="lg"
                  theme="blue"
                  width="100%"
                >
                  Open Syncstuff App
                </Button>

                <YStack space="$2">
                  <Text
                    color="$colorSubtitle"
                    fontSize="$2"
                    fontWeight="bold"
                    textAlign="center"
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
            onPress={() => (window.location.href = "/")}
            variant="outline"
          >
            Back to Home
          </Button>
        </YStack>
      </Card>
    </View>
  );
}
