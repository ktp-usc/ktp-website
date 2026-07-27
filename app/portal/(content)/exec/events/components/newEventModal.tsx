"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { event } from "@prisma/client";
import { usePointRequirements } from "@/hooks/usePointRequirements";
type eventInput = {
  PointRequirement: String;
  name: String;
  attendance: String[];
  description: String;
  startDate: String;
  location: String;
  activesOnly: Boolean;
};
type NewEventModalProps = {
  onClose: () => void;
  createEvent: (arg0: eventInput) => void;
};
export function NewEventModal({ onClose, createEvent }: NewEventModalProps) {
  const handleClose = () => {
    onClose();
  };

  const handlechange = (key: string, value: any) => {
    setEventData((prev: event) => ({ ...prev, [key]: value }));
  };

  const [eventData, setEventData] = useState({
    PointRequirement: "",
    name: "",
    attendance: [],
    description: "",
    startDate: "",
    location: "",
    activesOnly: false,
  });
  const { requirements } = usePointRequirements();

  const [pointRequirementDropdown, setPointRequirementDropdown] =
    useState(false);
  return (
    <div className="inset-0 bg-black/20 fixed" onClick={() => onClose()}>
      <div
        className="bg-white rounded-2xl p-4 m-16 w-fit ml-auto mr-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex space-between gap-40">
          <div>
            <h1 className="font-semibold text-xl">Create Attendance Event</h1>
            <p className="font-light text-slate-700">
              Configure the event details
            </p>
          </div>
          <X
            className="font-light text-slate-700 text-xl hover:text-red-600 cursor-pointer"
            onClick={() => handleClose()}
          />
        </div>
        <div className="mt-4 mb-4 gap-4 flex flex-col">
          <label>
            <p className="font-semibold">Event Name</p>
            <input
              className="border w-full rounded-lg p-1 focus:outline-none "
              value={eventData.name}
              name="name"
              placeholder="Weekly Chapter Meeting"
              onChange={(e) => handlechange(e.target.name, e.target.value)}
            ></input>
          </label>
          <label>
            <p className="font-semibold">Point Requirement</p>
            <button
              className="border w-full rounded-lg p-1 focus:outline-none flex justify-between items-center cursor-pointer"
              onClick={() => {
                setPointRequirementDropdown(!pointRequirementDropdown);
              }}
            >
              <p>
                {eventData.PointRequirement
                  ? `${eventData.PointRequirement}`
                  : "Select Point Requirement"}
              </p>
              {pointRequirementDropdown ? <ChevronUp /> : <ChevronDown />}
            </button>
            {pointRequirementDropdown && (
              <div className="flex flex-col p-1 rounded-lg border mt-2">
                {requirements.map((requirement) => (
                  <button
                    onClick={() => {
                      handlechange("PointRequirement", requirement.name);
                    }}
                    key={requirement.id}
                    className={`rounded-lg text-start text-lg text-slate-800 p-1 no-raise ${requirement.name === eventData.PointRequirement ? "bg-blue-800 text-white" : "hover:bg-blue-200"}`}
                  >{`${requirement.name}`}</button>
                ))}
              </div>
            )}
          </label>
          <label>
            <p className="font-semibold">Event Date & Time</p>
            <input
              type="datetime-local"
              step={60}
              className="border w-full rounded-lg p-1 focus:outline-none"
              name="startDate"
              value={eventData.startDate}
              onChange={(e) => handlechange(e.target.name, e.target.value)}
            />
          </label>
          <label>
            <p className="font-semibold">Location</p>
            <input
              className="border w-full rounded-lg p-1 focus:outline-none "
              value={eventData.location}
              name="location"
              placeholder="300 Main Room 200b"
              onChange={(e) => handlechange(e.target.name, e.target.value)}
            ></input>
          </label>
          <label>
            <p className="font-semibold">Description (Optional)</p>
            <textarea
              className="border w-full rounded-lg p-1 focus:outline-none"
              name="description"
              value={eventData.description}
              onChange={(e) => handlechange(e.target.name, e.target.value)}
            />
          </label>
          <label className="flex gap-4 items-center">
            <p className="font-semibold">Actives Only</p>

            <div
              className={`rounded-full p-1 flex items-center ${eventData.activesOnly ? "bg-blue-800" : "bg-gray-200"}`}
              onClick={() =>
                handlechange("activesOnly", !eventData.activesOnly)
              }
            >
              <button
                className={`p-2 rounded-full no-raise ${!eventData.activesOnly ? "bg-white" : ""}`}
              ></button>
              <button
                className={`p-2 rounded-full no-raise ${eventData.activesOnly ? "bg-white" : ""}`}
              ></button>
            </div>
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="border cursor-pointer border-blue-800 rounded-lg p-2 pl-4 pr-4 text-blue-800"
            onClick={() => handleClose()}
          >
            Cancel
          </button>
          <button
            className="border border-blue-800 rounded-lg p-2 pl-4 pr-4 bg-blue-800 cursor-pointer text-white"
            onClick={() => {
              createEvent(eventData);
            }}
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
}
