import express, { Request, Response } from "express";
import request from "request";
const app = express();
var client_id = "";
var client_secret = "";
var redirectURI = encodeURI("http://127.0.0.1:3000/callback");
var api_url = "";
const crypto = require("crypto");
function generateState() {
  return crypto.randomBytes(16).toString("hex");
}
const state = generateState();

// Step 1: Redirect user to Naver login
app.get("/naverlogin", (req: Request, res: Response) => {
  api_url =
    "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=" +
    client_id +
    "&redirect_uri=" +
    redirectURI +
    "&state=" +
    state;
  res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
  res.end(
    "<a href='" +
      api_url +
      "'><img height='50' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>"
  );
});

// Step 2: Handle the OAuth callback and request the access token
app.get("/callback", (req: Request, res: Response) => {
  var code = req.query.code;
  var state = req.query.state;

  api_url =
    "https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=" +
    client_id +
    "&client_secret=" +
    client_secret +
    "&redirect_uri=" +
    redirectURI +
    "&code=" +
    code +
    "&state=" +
    state;

  console.log("API url:", api_url);

  var options = {
    url: api_url,
    headers: {
      "X-Naver-Client-Id": client_id,
      "X-Naver-Client-Secret": client_secret,
    },
  };

  request.get(options, (error: any, response: any, body: any) => {
    if (!error && response.statusCode == 200) {
      const accessToken = JSON.parse(body).access_token;
      // Step 3: Use the access token to create a calendar event
      console.log("Success! Access token: ", accessToken);
      createCalendarEvent(accessToken, res);
    } else {
      res.status(response.statusCode).end();
      console.log("error = " + response.statusCode);
    }
  });
});

function createCalendarEvent(accessToken: string, res: Response) {
  var header = "Bearer " + accessToken; // Bearer token
  var calSum = "[제목] 캘린더API로 추가한 일정";
  var calDes = "[상세] 회의 합니다";
  var calLoc = "[장소] 그린팩토리";
  var uid = accessToken.substring(0, 15); // Use a portion of the token as a UUID

  var scheduleIcalString = "BEGIN:VCALENDAR\n";
  scheduleIcalString += "VERSION:2.0\n";
  scheduleIcalString += "PRODID:Naver Calendar\n";
  scheduleIcalString += "CALSCALE:GREGORIAN\n";
  scheduleIcalString += "BEGIN:VTIMEZONE\n";
  scheduleIcalString += "TZID:Asia/Seoul\n";
  scheduleIcalString += "BEGIN:STANDARD\n";
  scheduleIcalString += "DTSTART:19700101T000000\n";
  scheduleIcalString += "TZNAME:GMT+:00\n";
  scheduleIcalString += "TZOFFSETFROM:+0900\n";
  scheduleIcalString += "TZOFFSETTO:+0900\n";
  scheduleIcalString += "END:STANDARD\n";
  scheduleIcalString += "END:VTIMEZONE\n";
  scheduleIcalString += "BEGIN:VEVENT\n";
  scheduleIcalString += "SEQUENCE:0\n";
  scheduleIcalString += "CLASS:PUBLIC\n";
  scheduleIcalString += "TRANSP:OPAQUE\n";
  scheduleIcalString += "UID:" + uid + "\n"; // Unique ID
  scheduleIcalString += "DTSTART;TZID=Asia/Seoul:20240901T190000\n"; // Start time
  scheduleIcalString += "DTEND;TZID=Asia/Seoul:20240901T193000\n"; // End time
  scheduleIcalString += "SUMMARY:" + calSum + " \n"; // Event summary
  scheduleIcalString += "DESCRIPTION:" + calDes + " \n"; // Event description
  scheduleIcalString += "LOCATION:" + calLoc + " \n"; // Location
  scheduleIcalString += "ORGANIZER;CN=관리자:mailto:admin@sample.com\n"; // Organizer
  scheduleIcalString +=
    "ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=admin:mailto:user1@sample.com\n"; // Attendee
  scheduleIcalString += "CREATED:20161116T160000Z\n"; // Creation time
  scheduleIcalString += "LAST-MODIFIED:20161122T160000Z\n"; // Last modified time
  scheduleIcalString += "DTSTAMP:20161122T160000Z\n"; // Timestamp
  scheduleIcalString += "END:VEVENT\n";
  scheduleIcalString += "END:VCALENDAR";

  var api_url = "https://openapi.naver.com/calendar/createSchedule.json";
  var options = {
    url: api_url,
    form: {
      calendarId: "defaultCalendarId", // Specify your calendar ID
      scheduleIcalString: scheduleIcalString,
    },
    headers: {
      Authorization: header,
    },
  };

  request.post(options, (error: any, response: any, body: any) => {
    if (error) {
      console.error("Request error:", error);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Response status code:", response.statusCode);
    console.log("Response body:", body);

    if (response.statusCode === 200) {
      res.writeHead(200, { "Content-Type": "application/json;charset=utf-8" });
      res.end(body); // Respond with the API response
    } else {
      console.error("Failed to create calendar event:", response.statusCode);
      res.status(response.statusCode).end(body);
    }
  });
}

app.listen(3000, function () {
  console.log("http://127.0.0.1:3000/naverlogin app listening on port 3000!");
});

module.exports = app;
