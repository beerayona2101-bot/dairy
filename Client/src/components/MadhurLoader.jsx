import React from "react";
import PropTypes from "prop-types";
import BuffaloLoader from "./BuffaloLoader";

export default function MadhurLoader({ fullScreen = false, text }) {
  return (
    <BuffaloLoader
      variant={fullScreen ? "full" : "inline"}
      text={text || "Loading fresh dairy data..."}
    />
  );
}

MadhurLoader.propTypes = {
  fullScreen: PropTypes.bool,
  text: PropTypes.string,
};
