import React, { useState } from "react";
import axios from "axios";
import { FilePond, registerPlugin } from "react-filepond";
import "../node_modules/filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "../node_modules/filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "./App.css";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType
);

function App() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isIdentified, setIsIdentified] = useState(false);

  const formatClassName = (className) => {
    return className
      .split(",")[0]
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setResponseMessage("");
    setFeedbackGiven(false);
    if (files.length === 0) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setIsLoading(false);
      return;
    }

    const file = files[0].file;
    const imgURL = URL.createObjectURL(file);
    const img = new Image();
    img.src = imgURL;
    img.onload = async () => {
      try {
        const model = await mobilenet.load();
        const predictions = await model.classify(img);
        const predictedClassName = formatClassName(predictions[0].className);
        setResponseMessage(
          `The image has been identified as: ${predictedClassName}!`
        );
        setIsIdentified(true);
      } catch (error) {
        setResponseMessage(
          "An unkown error occurred while identifying the image. Please try again or with a new image."
        );
      } finally {
        setIsLoading(false);
        URL.revokeObjectURL(imgURL);
      }
    };
  };

  const handleFeedback = () => {
    setFeedbackGiven(true);
  };

  const handleRemoveFile = () => {
    setResponseMessage("");
    setFeedbackGiven(false);
    setIsIdentified(false);
  };

  return (
    <div className="App animate-fade flex justify-center select-none">
      {showAlert && (
        <div role="alert" className="alert alert-error fixed-alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Error! You can't identify an image without inputting one first!
          </span>
        </div>
      )}
      <div className="flex justify-center items-center h-screen">
        <div className="card card-border bg-neutral text-neutral-content w-[30rem] shadow-2xl">
          <div className="card-body items-center text-center">
            <img
              src="https://i.imgur.com/xbFYYXP.png"
              alt="Image Identifier Icon"
              className="select-none no-select w-16 h-16 mx-auto"
            />
            <h1 className="card-title text-3xl text-indigo-100 mb-4">
              Image Identifier
            </h1>
            <form onSubmit={handleSubmit}>
              <FilePond
                files={files}
                onupdatefiles={setFiles}
                acceptedFileTypes={["image/jpeg", "image/jpg", "image/png"]}
                className="w-96"
                server="https://api.dhanwanth.pp.ua/predict"
                credits={""}
                labelIdle="Drag & Drop your image or <span class='filepond--label-action'> Browse </span>"
                instantUpload={false}
                allowProcess={false}
                onremovefile={handleRemoveFile}
              />
              <button
                type="submit"
                className={`btn btn-primary w-96 ${
                  isLoading && "btn-primary:disabled"
                }`}
                disabled={isLoading || isIdentified}
              >
                {isLoading ? (
                  <span
                    className="loading loading-spinner"
                    style={{ color: "#050617" }}
                  />
                ) : isIdentified ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="#050617"
                    className="size-7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                ) : (
                  "Identify"
                )}
              </button>
            </form>
            {responseMessage && (
              <div>
                <hr className="my-4 bg-indigo-100 opacity-25" />
                <p className="text-indigo-100">
                  <b>{responseMessage}</b>
                </p>
                {!feedbackGiven ? (
                  <div className="flex flex-col items-center mt-4">
                    <p className="text-indigo-100 mb-2">Are we right?</p>

                    <div className="flex space-x-4">
                      <button
                        className="btn btn-square btn-outline btn-success"
                        onClick={handleFeedback}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                          />
                        </svg>
                      </button>
                      <button
                        className="btn btn-square btn-outline btn-error"
                        onClick={handleFeedback}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-indigo-100 mt-2">
                    Thanks for your feedback, we'll use this to help train our
                    model and make it better!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
