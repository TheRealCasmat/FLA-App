import React, { useState } from "react";
import axios from "axios";
import { FilePond, registerPlugin } from "react-filepond";
import "../node_modules/filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "../node_modules/filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "./App.css";

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

  const formatClassName = (className) => {
    return className
      .replace(/^\d+\./, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setResponseMessage("");

    if (files.length === 0) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", files[0].file);

    try {
      const response = await axios.post(
        "https://api.dhanwanth.pp.ua/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      let formattedClassName;

      try {
        const data = response.data;
        formattedClassName = formatClassName(data["class_name"]);
        setResponseMessage(
          `The image has been identified as: ${formattedClassName}!`
        );
      } catch (parseError) {
        setResponseMessage(
          "An unkown error occurred while identifying the image. Please try again or with a new image."
        );
      }
    } catch (error) {
      alert("An error occurred. Please try again. Info: " + error);
    } finally {
      setIsLoading(false);
    }
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
              />
              <button
                type="submit"
                className={`btn btn-primary w-96 ${
                  isLoading && "btn-primary:disabled"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span
                    className="loading loading-spinner"
                    style={{ color: "#050617" }}
                  />
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
