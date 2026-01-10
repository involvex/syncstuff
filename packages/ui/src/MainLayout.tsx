import "./_MainLayout.css";
const _cn4 =
  "font_body _ff- _dsp-inline _bxs-border-box _ww-break-word _ws-pre-wrap _mt-0px _mr-0px _mb-0px _ml-0px _col-color _fos- _fow-bold ";
const _cn3 =
  "_dsp-flex _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-0 _fd-row _h-64px _ai-center _jc-space-betwe3241 _pr-t-space-4 _pl-t-space-4 _bbw-1px _btc-borderColor _brc-borderColor _bbc-borderColor _blc-borderColor _bbs-solid ";
const _cn2 =
  "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _pos-relative _mih-0px _miw-0px _fs-1 _fd-column _fg-1 ";
const _cn =
  "_dsp-flex _ai-stretch _fb-auto _bxs-border-box _mih-0px _miw-0px _fs-0 _fd-row _pos-absolute _t-0px _r-0px _b-0px _l-0px _bg-background ";
import React from "react";
import { YStack, XStack, Text, ScrollView } from "tamagui";
import { ThemeToggle } from "./ThemeToggle";
export interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  title?: string;
}
export function MainLayout({
  children,
  sidebar,
  header,
  title,
}: MainLayoutProps) {
  return (
    <div className={_cn}>
      {/* Sidebar */}
      {sidebar && (
        <YStack
          width={280}
          borderRightWidth={1}
          borderColor="$borderColor"
          backgroundColor="$surface"
          $sm={{
            display: "none",
          }}
        >
          {sidebar}
        </YStack>
      )}

      {/* Main Content */}
      <div className={_cn2}>
        {/* Header */}
        <div className={_cn3}>
          <XStack alignItems="center" space="$4">
            {title && <span className={_cn4}>{title}</span>}
            {header}
          </XStack>
          <ThemeToggle />
        </div>

        {/* Content */}
        <ScrollView flex={1}>
          <YStack
            padding="$4"
            space="$4"
            maxWidth={1200}
            marginHorizontal="auto"
            width="100%"
          >
            {children}
          </YStack>
        </ScrollView>
      </div>
    </div>
  );
}
