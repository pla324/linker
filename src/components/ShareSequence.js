import CopyToClipboard from "react-copy-to-clipboard";
import React, { useMemo } from "react";
import { toast } from "react-toastify";
import { Button } from "../GlobalStyles";
import {NAME, DOMAIN} from '../constants';

const getShareString = (guesses, score) => {
  let shareString = `#${NAME} - Score: ${score}\n`;
  for (let i = 0; i < guesses.length; i++) {
    if (i === guesses.length - 1) {
      shareString += guesses[i];
    } else {
      shareString += `${guesses[i]} \u2192 `;
    }
  }
  shareString += `\n${DOMAIN}`;
  return shareString;
}

export function ShareSequence({ guesses, score }) {
  const shareText = useMemo(() => getShareString(guesses, score), []);

  return (
    <CopyToClipboard
      text={shareText}
      onCopy={() => toast("Sequence Copied! ✅", { autoClose: 2000 })}
      options={{ format: "text/plain" }}
    >
      <Button variant="contained"><span>Share Sequence</span></Button>
    </CopyToClipboard>
  )
}

