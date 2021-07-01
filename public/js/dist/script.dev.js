"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var path = location.pathname.split("/");

function startVideo() {
  navigator.getUserMedia({
    video: {}
  }, function (stream) {
    video.srcObject = stream;
    videoStream = stream;
  }, function (err) {
    return console.error(err);
  });
} // when the document is ready, init this


$(document).ready(function () {
  // toggle the employee's data
  $("#empDataToggle").on("click", function () {
    $("#theToggledEmpData").slideToggle(500);
  }); // toggle the capture face

  $("#empCaptureToggle").on("click", function () {
    $("#theToggledCaptureFace").slideToggle(500);
  }); // load the table data

  function loadTableData(records) {
    var table = document.getElementById("recordBody");
    records.forEach(function (record, index) {
      var row = table.insertRow();
      var number = row.insertCell(0); // insert number cell

      number.innerHTML = index + 1;
      var date = row.insertCell(1); // insert date cell

      date.innerHTML = moment(record.createdAt).format("MMMM Do, YYYY");
      var clockIn = row.insertCell(2); // insert clock in cell

      clockIn.innerHTML = moment(record.createdAt).format("h:mm a");
      var clockOut = row.insertCell(3); // insert clock out cell

      clockOut.innerHTML = record.status === 0 ? moment(record.updatedAt).format("h:mm a") : "NIL";
    });
  } // fill theh details in the emp details page


  function fillEmpDetails(isCompleted, msg, _ref) {
    var imageData = _ref.imageData,
        fname = _ref.fname,
        lname = _ref.lname,
        email = _ref.email,
        phone = _ref.phone,
        records = _ref.records;
    var imgData = readImageFile("http://localhost:5000/storage/empImageData/".concat(imageData));
    $("#profileImg").attr("src", imgData);
    $("#txtFname").html("<i class='fa fa-edit'></i> First Name: <span>".concat(fname, "</span>"));
    $("#txtLname").html("<i class='fa fa-edit'></i> Last Name: <span>".concat(lname, "</span>"));
    $("#txtEmail").html("<i class='fa fa-envelope'></i> Email: <span>".concat(email, "</span>"));
    $("#txtPhone").html("<i class='fa fa-mobile'></i> Phone: <span>".concat(phone, "</span>"));
    $("#clockInStatus").addClass(isCompleted ? "text-success" : "text-danger").text(msg); // populate the records table

    loadTableData(records);
  } // on load of the home page, if out variable in local storage
  // is not null, remove the current user_id from the user_ids array


  if (path[1] === "") {
    var current_user_id = JSON.parse(localStorage.getItem("current_user_id"));
    var out = JSON.parse(localStorage.getItem("out"));

    if (out !== null) {
      // set the status of the employee to 0
      axios.post("http://localhost:5000/employees/clock-out", {
        empID: current_user_id
      }).then(function (res) {
        var _res$data = res.data,
            isCompleted = _res$data.isCompleted,
            msg = _res$data.msg; // destructure res.data

        if (isCompleted) {
          // remove the current user_id from the array of user_ids in the local storage
          var user_ids = JSON.parse(localStorage.getItem("user_ids"));
          var other_user_ids = user_ids.filter(function (id) {
            return id !== current_user_id;
          });
          localStorage.setItem("user_ids", JSON.stringify(other_user_ids));
          $.notify({
            message: "<i class='fa fa-check-circle'></i> ".concat(msg)
          }, {
            type: "success"
          });
        } else {
          $.notify({
            message: "<i class='fa fa-exclamation-circle'></i> ".concat(msg)
          }, {
            type: "danger"
          });
        }

        localStorage.removeItem("out");
      })["catch"](function (err) {
        $.notify({
          message: "<i class='fa fa-exclamation-circle'></i> ".concat(err)
        }, {
          type: "danger"
        });
      });
    }
  } // fetch the details of the user with the id saved in local storage


  if (path[1] === "emp-details") {
    if (localStorage.getItem("current_user_id") === null || JSON.parse(localStorage.getItem("current_user_id")) === "") {
      $.notify({
        message: "<i class='fa fa-exclamation-circle'></i> Please Clock In First!"
      }, {
        type: "danger"
      });
      window.location = "/clock-in";
    } else {
      var _current_user_id = JSON.parse(localStorage.getItem("current_user_id"));

      axios.post("http://localhost:5000/employees/clock-in", {
        empID: _current_user_id
      }).then(function (res) {
        var _res$data2 = res.data,
            isCompleted = _res$data2.isCompleted,
            employee = _res$data2.employee,
            clockedIn = _res$data2.clockedIn,
            msg = _res$data2.msg; // destructure res.data

        if (isCompleted) {
          $.notify({
            message: "<i class='fa fa-check-circle'></i> ".concat(msg)
          }, {
            type: "success"
          });
        } else {
          $.notify({
            message: "<i class='fa fa-exclamation-circle'></i> ".concat(msg)
          }, {
            type: "danger"
          });
        } // if the user has clocked in already


        if (clockedIn) {
          var user_ids = JSON.parse(localStorage.getItem("user_ids"));
          var other_user_ids = user_ids.filter(function (id) {
            return id !== _current_user_id;
          });
          localStorage.setItem("user_ids", JSON.stringify(other_user_ids));
        }

        fillEmpDetails(isCompleted, msg, employee);
      })["catch"](function (err) {
        $.notify({
          message: "<i class='fa fa-exclamation-circle'></i> ".concat(err)
        }, {
          type: "danger"
        });
      });
    }
  } // register the new employee


  $("form[action='/register']").on("submit", function (e) {
    e.preventDefault(); // get all the form data

    var fname = $.trim($("#fname").val()),
        lname = $.trim($("#lname").val()),
        email = $.trim($("#email").val()),
        phone = $.trim($("#phone").val()),
        password = $.trim($("#password").val()),
        imageData = $.trim($("#imageData").val());

    if (fname === "" || lname === "" || email === "" || phone === "" || password === "") {
      $.notify({
        message: "<i class='fa fa-exclamation-circle'></i> All Fields are Required!"
      }, {
        type: "danger"
      });
    } else {
      // check if the base 64 string is available after capturing
      if (imageData === "") {
        $.notify({
          message: "<i class='fa fa-exclamation-circle'></i> Capture Your Face!"
        }, {
          type: "danger"
        });
      } else {
        $.notify({
          message: "<i class='fa fa-info-circle'></i> Registering..."
        }, {
          type: "info"
        });
        $.ajax({
          method: "POST",
          url: "http://localhost:5000/employees/register",
          data: {
            fname: fname,
            lname: lname,
            email: email,
            phone: phone,
            password: password,
            imageData: imageData
          },
          headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
          },
          success: function success(data) {
            var isCompleted = data.isCompleted,
                msg = data.msg;

            if (isCompleted) {
              $.notify({
                message: msg
              }, {
                type: "success"
              });
              window.location = "http://localhost:5000/register";
            } else {
              // if the error messages is of type object(array)
              if (_typeof(msg) === "object") {
                msg.forEach(function (mainMsg) {
                  $.notify({
                    message: mainMsg.msg
                  }, {
                    type: "danger"
                  });
                });
              } else {
                // if error message is just a single message
                $.notify({
                  message: msg
                }, {
                  type: "danger"
                });
              }
            }
          },
          error: function error(err) {
            $.notify({
              message: err
            }, {
              type: "danger"
            });
          }
        });
      }
    }
  });
}); // function to handle the recognizing of the face

var recognizeFace = function recognizeFace(from) {
  var video = document.getElementById("video");
  Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri("../face-models"), faceapi.nets.faceLandmark68Net.loadFromUri("../face-models"), faceapi.nets.faceRecognitionNet.loadFromUri("../face-models"), faceapi.nets.faceExpressionNet.loadFromUri("../face-models"), faceapi.nets.ssdMobilenetv1.loadFromUri("../face-models")]).then(startVideo); // recognize face when the video starts playing

  video.addEventListener("play", function () {
    axios.get("http://localhost:5000/employees").then(function _callee2(res) {
      var _res$data3, isCompleted, employees, canvas, displaySize, labeledFaceDescriptors, faceMatcher, setIntervalFacialRec;

      return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _res$data3 = res.data, isCompleted = _res$data3.isCompleted, employees = _res$data3.employees;

              if (!isCompleted) {
                _context2.next = 12;
                break;
              }

              canvas = faceapi.createCanvasFromMedia(video);
              document.body.append(canvas);
              displaySize = {
                width: 70,
                height: 50
              };
              faceapi.matchDimensions(canvas, displaySize);
              document.getElementById("currentStatus").innerHTML = '<i class="fa fa-info-circle"></i> Detecting Current Face... <i class="fa fa-spinner fa-spin"></i>';
              _context2.next = 9;
              return regeneratorRuntime.awrap(loadImages(employees));

            case 9:
              labeledFaceDescriptors = _context2.sent;
              // console.log(labeledFaceDescriptors);
              faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
              setIntervalFacialRec = setInterval(function _callee() {
                var detections, resizedDetections, results, user_id, user_ids, storedUser_ids, index;
                return regeneratorRuntime.async(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return regeneratorRuntime.awrap(faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors());

                      case 2:
                        detections = _context.sent;
                        // console.log(detections);
                        resizedDetections = faceapi.resizeResults(detections, displaySize); // console.log(resizedDetections);

                        document.getElementById("currentStatus").innerHTML = '<i class="fa fa-info-circle"></i> Matching Face... <i class="fa fa-spinner fa-spin"></i>';
                        results = resizedDetections.map(function (d) {
                          return faceMatcher.findBestMatch(d.descriptor);
                        });
                        results.forEach(function (result) {
                          user_id = result._label; // label is the id of the user i put in the labeledImages
                        });

                        if (user_id !== "unknown" && user_id !== undefined) {
                          clearInterval(setIntervalFacialRec); // whether its clock in or clock out, save the current
                          // person using the system to local storage

                          localStorage.setItem("current_user_id", JSON.stringify(user_id)); // if clock in, add the user_id to the array of user_ids
                          // so that it will be removed

                          if (from === "in") {
                            // for clock in
                            // array to save all the employee ids clocking in
                            user_ids = [];

                            if (JSON.parse(localStorage.getItem("user_ids")) === null) {
                              // the first time user is clocking in
                              user_ids.push(user_id);
                              localStorage.setItem("user_ids", JSON.stringify(user_ids));
                            } else {
                              // different employees have clocked in already
                              storedUser_ids = JSON.parse(localStorage.getItem("user_ids"));
                              index = storedUser_ids.indexOf(user_id); // meaning the user is not in the user_ids array

                              if (index === -1) {
                                storedUser_ids.push(user_id);
                                localStorage.setItem("user_ids", JSON.stringify(storedUser_ids));
                              }
                            }

                            window.location = "/emp-details";
                          } else {
                            // for clock out
                            // set a variable to local storage and
                            // check for it in the emp details page
                            localStorage.setItem("out", JSON.stringify("out"));
                            window.location = "/";
                          }
                        }

                      case 8:
                      case "end":
                        return _context.stop();
                    }
                  }
                });
              }, 100);

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      });
    })["catch"](function (err) {
      $.notify({
        message: "<i class='fa fa-exclamation-circle'></i> ".concat(err)
      }, {
        type: "danger"
      });
    });
  });
}; // recognize face


if (path[1] === "clock-in") {
  recognizeFace("in");
} else if (path[1] === "clock-out") {
  recognizeFace("out");
} // load labeled Images


function loadImages(empDetails) {
  return Promise.all(empDetails.map(function _callee3(emp) {
    var descriptions, imageData, img, detections;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            descriptions = [];
            imageData = readImageFile("http://localhost:5000/storage/empImageData/".concat(emp.imageData)); // emp.imageData is the name of the file in the database

            _context3.next = 4;
            return regeneratorRuntime.awrap(faceapi.fetchImage(imageData));

          case 4:
            img = _context3.sent;
            _context3.next = 7;
            return regeneratorRuntime.awrap(faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor());

          case 7:
            detections = _context3.sent;
            descriptions.push(detections.descriptor);
            return _context3.abrupt("return", new faceapi.LabeledFaceDescriptors(emp._id, descriptions));

          case 10:
          case "end":
            return _context3.stop();
        }
      }
    });
  }));
} // read the image file


function readImageFile(filename) {
  var allText;
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", filename, false);

  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) allText = rawFile.responseText;
    }
  };

  rawFile.send(null);
  return allText;
}