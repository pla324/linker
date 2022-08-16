import CopyToClipboard from "react-copy-to-clipboard";
import React, { useMemo } from "react";
import { toast } from "react-toastify";
import { Button } from "../GlobalStyles";
import {NAME, DOMAIN} from '../constants';

const getShareString = (start, end, score) => {
  let shareString = `#${NAME}\n${start} \u2192 ${end} in ${score} links!\nTry to beat me: `;
  const uri = encodeURI(`${DOMAIN}/?end=${end}&start=${start}`)
  shareString += uri;
  return shareString;
}

export function Share({ start, end, score }) {
  const shareText = useMemo(() => getShareString(start, end, score), []);

  return (
    <CopyToClipboard
      text={shareText}
      onCopy={() => toast("Challenge Link Copied ✅", { autoClose: 2000 })}
      options={{ format: "text/plain" }}
    >
      <Button variant="contained"><span>Copy Challenge Link!</span></Button>
    </CopyToClipboard>
  )
}

