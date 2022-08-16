import CopyToClipboard from "react-copy-to-clipboard";
import React, { useMemo } from "react";
import { toast } from "react-toastify";
import { Button } from "../GlobalStyles";

const getShareString = (start, end, score) => {
  let shareString = `[WikiLinker]\n${start} \u2192 ${end} in ${score} links!\n`;
  const uri = encodeURI(`https://wikilinker.netlify.app/?end=${end}&start=${start}`)
  shareString += uri;
  return shareString;
}

export function Share({ start, end, score }) {
  const shareText = useMemo(() => getShareString(start, end, score), []);

  return (
    <CopyToClipboard
      text={shareText}
      onCopy={() => toast("Share Link Copied", { autoClose: 2000 })}
      options={{ format: "text/plain" }}
    >
      <Button variant="contained"><span>Share Link!</span></Button>
    </CopyToClipboard>
  )
}

