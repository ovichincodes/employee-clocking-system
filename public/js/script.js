const path = location.pathname.split("/");
function startVideo() {
	navigator.getUserMedia(
		{ video: {} },
		(stream) => {
			video.srcObject = stream;
			videoStream = stream;
		},
		(err) => console.error(err)
	);
}

// when the document is ready, init this
$(document).ready(function () {
	// toggle the employee's data
	$("#empDataToggle").on("click", function () {
		$("#theToggledEmpData").slideToggle(500);
	});

	// toggle the capture face
	$("#empCaptureToggle").on("click", function () {
		$("#theToggledCaptureFace").slideToggle(500);
	});

	// load the table data
	function loadTableData(records) {
		const table = document.getElementById("recordBody");
		records.forEach((record, index) => {
			let row = table.insertRow();
			let number = row.insertCell(0); // insert number cell
			number.innerHTML = index + 1;
			let date = row.insertCell(1); // insert date cell
			date.innerHTML = moment(record.createdAt).format("MMMM Do, YYYY");
			let clockIn = row.insertCell(2); // insert clock in cell
			clockIn.innerHTML = moment(record.createdAt).format("h:mm a");
			let clockOut = row.insertCell(3); // insert clock out cell
			clockOut.innerHTML =
				record.status === 0
					? moment(record.updatedAt).format("h:mm a")
					: "NIL";
		});
	}

	// fill theh details in the emp details page
	function fillEmpDetails(
		isCompleted,
		msg,
		{ imageData, fname, lname, email, phone, records }
	) {
		let imgData = readImageFile(
			`http://localhost:5000/storage/empImageData/${imageData}`
		);
		$("#profileImg").attr("src", imgData);
		$("#txtFname").html(
			`<i class='fa fa-edit'></i> First Name: <span>${fname}</span>`
		);
		$("#txtLname").html(
			`<i class='fa fa-edit'></i> Last Name: <span>${lname}</span>`
		);
		$("#txtEmail").html(
			`<i class='fa fa-envelope'></i> Email: <span>${email}</span>`
		);
		$("#txtPhone").html(
			`<i class='fa fa-mobile'></i> Phone: <span>${phone}</span>`
		);
		$("#clockInStatus")
			.addClass(isCompleted ? "text-success" : "text-danger")
			.text(msg);
		// populate the records table
		loadTableData(records);
	}

	// on load of the home page, if out variable in local storage
	// is not null, remove the current user_id from the user_ids array
	if (path[1] === "") {
		let current_user_id = JSON.parse(
			localStorage.getItem("current_user_id")
		);
		let out = JSON.parse(localStorage.getItem("out"));
		if (out !== null) {
			// set the status of the employee to 0
			axios
				.post("http://localhost:5000/employees/clock-out", {
					empID: current_user_id,
				})
				.then((res) => {
					let { isCompleted, msg } = res.data; // destructure res.data
					if (isCompleted) {
						// remove the current user_id from the array of user_ids in the local storage
						const user_ids = JSON.parse(
							localStorage.getItem("user_ids")
						);
						const other_user_ids = user_ids.filter(
							(id) => id !== current_user_id
						);
						localStorage.setItem(
							"user_ids",
							JSON.stringify(other_user_ids)
						);
						$.notify(
							{
								message: `<i class='fa fa-check-circle'></i> ${msg}`,
							},
							{ type: "success" }
						);
					} else {
						$.notify(
							{
								message: `<i class='fa fa-exclamation-circle'></i> ${msg}`,
							},
							{ type: "danger" }
						);
					}
					localStorage.removeItem("out");
				})
				.catch((err) => {
					$.notify(
						{
							message: `<i class='fa fa-exclamation-circle'></i> ${err}`,
						},
						{ type: "danger" }
					);
				});
		}
	}

	// fetch the details of the user with the id saved in local storage
	if (path[1] === "emp-details") {
		if (
			localStorage.getItem("current_user_id") === null ||
			JSON.parse(localStorage.getItem("current_user_id")) === ""
		) {
			$.notify(
				{
					message:
						"<i class='fa fa-exclamation-circle'></i> Please Clock In First!",
				},
				{ type: "danger" }
			);
			window.location = "/clock-in";
		} else {
			let current_user_id = JSON.parse(
				localStorage.getItem("current_user_id")
			);
			axios
				.post("http://localhost:5000/employees/clock-in", {
					empID: current_user_id,
				})
				.then((res) => {
					let { isCompleted, employee, clockedIn, msg } = res.data; // destructure res.data
					if (isCompleted) {
						$.notify(
							{
								message: `<i class='fa fa-check-circle'></i> ${msg}`,
							},
							{ type: "success" }
						);
					} else {
						$.notify(
							{
								message: `<i class='fa fa-exclamation-circle'></i> ${msg}`,
							},
							{ type: "danger" }
						);
					}
					// if the user has clocked in already
					if (clockedIn) {
						const user_ids = JSON.parse(
							localStorage.getItem("user_ids")
						);
						const other_user_ids = user_ids.filter(
							(id) => id !== current_user_id
						);
						localStorage.setItem(
							"user_ids",
							JSON.stringify(other_user_ids)
						);
					}
					fillEmpDetails(isCompleted, msg, employee);
				})
				.catch((err) => {
					$.notify(
						{
							message: `<i class='fa fa-exclamation-circle'></i> ${err}`,
						},
						{ type: "danger" }
					);
				});
		}
	}

	// register the new employee
	$("form[action='/register']").on("submit", function (e) {
		e.preventDefault();
		// get all the form data
		const fname = $.trim($("#fname").val()),
			lname = $.trim($("#lname").val()),
			email = $.trim($("#email").val()),
			phone = $.trim($("#phone").val()),
			password = $.trim($("#password").val()),
			imageData = $.trim($("#imageData").val());
		if (
			fname === "" ||
			lname === "" ||
			email === "" ||
			phone === "" ||
			password === ""
		) {
			$.notify(
				{
					message:
						"<i class='fa fa-exclamation-circle'></i> All Fields are Required!",
				},
				{ type: "danger" }
			);
		} else {
			// check if the base 64 string is available after capturing
			if (imageData === "") {
				$.notify(
					{
						message:
							"<i class='fa fa-exclamation-circle'></i> Capture Your Face!",
					},
					{ type: "danger" }
				);
			} else {
				$.notify(
					{
						message:
							"<i class='fa fa-info-circle'></i> Registering...",
					},
					{ type: "info" }
				);
				$.ajax({
					method: "POST",
					url: "http://localhost:5000/employees/register",
					data: { fname, lname, email, phone, password, imageData },
					headers: {
						"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr(
							"content"
						),
					},
					success: (data) => {
						let { isCompleted, msg } = data;
						if (isCompleted) {
							$.notify(
								{
									message: msg,
								},
								{ type: "success" }
							);
							window.location = "http://localhost:5000/register";
						} else {
							// if the error messages is of type object(array)
							if (typeof msg === "object") {
								msg.forEach((mainMsg) => {
									$.notify(
										{
											message: mainMsg.msg,
										},
										{ type: "danger" }
									);
								});
							} else {
								// if error message is just a single message
								$.notify(
									{
										message: msg,
									},
									{ type: "danger" }
								);
							}
						}
					},
					error: (err) => {
						$.notify(
							{
								message: err,
							},
							{ type: "danger" }
						);
					},
				});
			}
		}
	});
});

// function to handle the recognizing of the face
const recognizeFace = (from) => {
	const video = document.getElementById("video");

	Promise.all([
		faceapi.nets.tinyFaceDetector.loadFromUri("../face-models"),
		faceapi.nets.faceLandmark68Net.loadFromUri("../face-models"),
		faceapi.nets.faceRecognitionNet.loadFromUri("../face-models"),
		faceapi.nets.faceExpressionNet.loadFromUri("../face-models"),
		faceapi.nets.ssdMobilenetv1.loadFromUri("../face-models"),
	]).then(startVideo);

	// recognize face when the video starts playing
	video.addEventListener("play", () => {
		axios
			.get("http://localhost:5000/employees")
			.then(async (res) => {
				let { isCompleted, employees } = res.data;
				if (isCompleted) {
					const canvas = faceapi.createCanvasFromMedia(video);
					document.body.append(canvas);
					const displaySize = { width: 70, height: 50 };
					faceapi.matchDimensions(canvas, displaySize);
					document.getElementById("currentStatus").innerHTML =
						'<i class="fa fa-info-circle"></i> Detecting Current Face... <i class="fa fa-spinner fa-spin"></i>';
					const labeledFaceDescriptors = await loadImages(employees);
					// console.log(labeledFaceDescriptors);
					const faceMatcher = new faceapi.FaceMatcher(
						labeledFaceDescriptors,
						0.6
					);
					const setIntervalFacialRec = setInterval(async () => {
						const detections = await faceapi
							.detectAllFaces(
								video,
								new faceapi.TinyFaceDetectorOptions()
							)
							.withFaceLandmarks()
							.withFaceDescriptors();

						// console.log(detections);
						const resizedDetections = faceapi.resizeResults(
							detections,
							displaySize
						);
						// console.log(resizedDetections);
						document.getElementById("currentStatus").innerHTML =
							'<i class="fa fa-info-circle"></i> Matching Face... <i class="fa fa-spinner fa-spin"></i>';
						const results = resizedDetections.map((d) =>
							faceMatcher.findBestMatch(d.descriptor)
						);
						let user_id;
						results.forEach((result) => {
							user_id = result._label; // label is the id of the user i put in the labeledImages
						});
						if (user_id !== "unknown" && user_id !== undefined) {
							clearInterval(setIntervalFacialRec);
							// whether its clock in or clock out, save the current
							// person using the system to local storage
							localStorage.setItem(
								"current_user_id",
								JSON.stringify(user_id)
							);
							// if clock in, add the user_id to the array of user_ids
							// so that it will be removed
							if (from === "in") {
								// for clock in
								// array to save all the employee ids clocking in
								let user_ids = [];
								if (
									JSON.parse(
										localStorage.getItem("user_ids")
									) === null
								) {
									// the first time user is clocking in
									user_ids.push(user_id);
									localStorage.setItem(
										"user_ids",
										JSON.stringify(user_ids)
									);
								} else {
									// different employees have clocked in already
									let storedUser_ids = JSON.parse(
										localStorage.getItem("user_ids")
									);
									const index = storedUser_ids.indexOf(
										user_id
									);
									// meaning the user is not in the user_ids array
									if (index === -1) {
										storedUser_ids.push(user_id);
										localStorage.setItem(
											"user_ids",
											JSON.stringify(storedUser_ids)
										);
									}
								}
								window.location = "/emp-details";
							} else {
								// for clock out
								// set a variable to local storage and
								// check for it in the emp details page
								localStorage.setItem(
									"out",
									JSON.stringify("out")
								);
								window.location = "/";
							}
						}
					}, 100);
				}
			})
			.catch((err) => {
				$.notify(
					{
						message: `<i class='fa fa-exclamation-circle'></i> ${err}`,
					},
					{ type: "danger" }
				);
			});
	});
};

// recognize face
if (path[1] === "clock-in") {
	recognizeFace("in");
} else if (path[1] === "clock-out") {
	recognizeFace("out");
}

// load labeled Images
function loadImages(empDetails) {
	return Promise.all(
		empDetails.map(async (emp) => {
			const descriptions = [];
			let imageData = readImageFile(
				`http://localhost:5000/storage/empImageData/${emp.imageData}`
			); // emp.imageData is the name of the file in the database
			const img = await faceapi.fetchImage(imageData);
			// console.log(img);
			const detections = await faceapi
				.detectSingleFace(img)
				.withFaceLandmarks()
				.withFaceDescriptor();
			descriptions.push(detections.descriptor);
			return new faceapi.LabeledFaceDescriptors(emp._id, descriptions);
		})
	);
}

// read the image file
function readImageFile(filename) {
	let allText;
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", filename, false);
	rawFile.onreadystatechange = function () {
		if (rawFile.readyState === 4) {
			if (rawFile.status === 200 || rawFile.status == 0)
				allText = rawFile.responseText;
		}
	};
	rawFile.send(null);
	return allText;
}
