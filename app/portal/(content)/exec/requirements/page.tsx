"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePointRequirements } from "@/hooks/usePointRequirements";
import { Requirement } from "./components/requirement";
import { nextSemesters } from "@/data/requirementOptions";

export default function Page() {
  const {
    createPointRequirement,
    updatePointRequirement,
    deletePointRequirement,
    requirements,
  } = usePointRequirements();

  const [semesterDropdown, setSemesterDropdown] = useState(false);

  const [requirementDetails, setRequirementDetails] = useState({
    memberType: "ALL_MEMBERS",
    name: "",
    semester: nextSemesters[0],
    description: "",
    requiredAmount: 0,
    pointsPerCompletion: 0,
    maxPoints: 0,
  });

  function handleChange(name: string, value: any) {
    setRequirementDetails((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setRequirementDetails({
      memberType: "ALL_MEMBERS",
      name: "",
      semester: nextSemesters[0],
      description: "",
      requiredAmount: 0,
      pointsPerCompletion: 0,
      maxPoints: 0,
    });
  }

  useEffect(() => {
    if (!semesterDropdown) {
      return;
    }

    const handleClick = () => {
      setSemesterDropdown(false);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [semesterDropdown]);
  function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    createPointRequirement(requirementDetails);
    resetForm();
  }
  return (
    <div className="grid lg:grid-cols-2">
      <form className="m-8 bg-white border border-gray-200 rounded-2xl p-8 flex flex-col gap-8">
        <div className="border-b border-gray-200 pb-8 flex flex-col gap-8">
          <div>
            <h1 className="font-semibold text-xl">Scope</h1>
            <p className="font-light">
              To who and when should the requirement take place?
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-semibold ">Semester</p>
            <button
              type="button"
              className="cursor-pointer flex justify-between w-full items-center border rounded-md p-2 no-raise"
              onClick={() => {
                setSemesterDropdown(true);
              }}
            >
              {`${requirementDetails.semester !== "" ? requirementDetails.semester : "Select a Semester"}`}
              {semesterDropdown ? <ChevronUp /> : <ChevronDown />}
            </button>
            {semesterDropdown && (
              <div className="flex flex-col items-start p-1 border border-gray-200 rounded-lg mt-2 ">
                <button
                  type="button"
                  name="semester"
                  className="no-raise cursor-pointer hover:bg-blue-200 w-full text-start rounded-md p-2"
                  onClick={() => handleChange("semester", nextSemesters[0])}
                >
                  {nextSemesters[0]}
                </button>
                <button
                  type="button"
                  className="no-raise cursor-pointer hover:bg-blue-200 w-full text-start rounded-md p-2"
                  onClick={() => handleChange("semester", nextSemesters[1])}
                >
                  {nextSemesters[1]}
                </button>
                <button
                  type="button"
                  className="no-raise cursor-pointer hover:bg-blue-200 w-full text-start rounded-md p-2"
                  onClick={() => handleChange("semester", nextSemesters[2])}
                >
                  {nextSemesters[2]}
                </button>
                <button
                  type="button"
                  className="no-raise cursor-pointer hover:bg-blue-200 w-full text-start rounded-md p-2"
                  onClick={() => handleChange("semester", nextSemesters[3])}
                >
                  {nextSemesters[3]}
                </button>
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold mb-2">Member Type</p>
            <div className="flex justify-around border border-gray-200 rounded-sm p-1">
              <button
                type="button"
                className={`no-raise cursor-pointer p-3 w-full rounded-sm ${requirementDetails.memberType == "ALL_MEMBERS" ? "bg-blue-200" : "hover:bg-blue-100"}`}
                onClick={() => handleChange("memberType", "ALL_MEMBERS")}
              >
                All Members
              </button>
              <button
                type="button"
                className={`no-raise cursor-pointer p-3 w-full rounded-sm ${requirementDetails.memberType == "PLEDGE" ? "bg-blue-200" : "hover:bg-blue-100"}`}
                onClick={() => handleChange("memberType", "PLEDGE")}
              >
                Pledge
              </button>
              <button
                type="button"
                className={`no-raise cursor-pointer p-3 w-full rounded-sm ${requirementDetails.memberType == "ACTIVE" ? "bg-blue-200" : "hover:bg-blue-100"}`}
                onClick={() => handleChange("memberType", "ACTIVE")}
              >
                Active
              </button>
              <button
                type="button"
                className={`no-raise cursor-pointer  p-3 w-full rounded-sm ${requirementDetails.memberType == "PNM" ? "bg-blue-200" : "hover:bg-blue-100"}`}
                onClick={() => handleChange("memberType", "PNM")}
              >
                PNM
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 pb-8 border-grey-200 border-b">
          <div>
            <h1 className="font-semibold text-xl">Requirement</h1>
            <p>The activity that needs completed</p>
          </div>
          <label className="flex flex-col gap-2 ">
            <p className="font-semibold">Requirement name</p>
            <input
              placeholder="e.g. Coffee Chats"
              className="border border-grey-200 w-full p-2 rounded-md"
              value={requirementDetails.name}
              onChange={(e) => handleChange("name", e.target.value)}
            ></input>
          </label>
          <label>
            <p className="mb-1 font-semibold">Description</p>
            <textarea
              value={requirementDetails.description}
              placeholder="e.g. Pledges must complete 10 coffee chats by the end of the semester"
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full p-1 rounded-md border border-grey-200 h-28"
            ></textarea>
          </label>
        </div>
        <div className="flex flex-col gap-4 pb-8 border-b border-grey-200">
          <div>
            <h1 className="font-semibold text-xl">Points</h1>
            <p>How completion contributes to the semester total</p>
          </div>
          <div>
            <div className="flex gap-4">
              <label className="w-full mb-1">
                <p className="font-semibold">Required Count</p>
                <input
                  className="border border-grey-200 rounded-md p-1 w-full"
                  value={requirementDetails.requiredAmount}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    Number.isInteger(num)
                      ? handleChange("requiredAmount", Number(e.target.value))
                      : console.log(e.target.value, "is not a number");
                  }}
                ></input>
              </label>
              <label className="w-full">
                <p className="font-semibold">Points Per Completion</p>
                <input
                  className="border border-grey-200 rounded-md p-1 w-full "
                  value={requirementDetails.pointsPerCompletion}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    Number.isInteger(num)
                      ? handleChange(
                          "pointsPerCompletion",
                          Number(e.target.value),
                        )
                      : console.log(e.target.value, "is not a number");
                  }}
                ></input>
              </label>
              <label className="w-full ">
                <p className="font-semibold">Maximum points</p>
                <input
                  className="border border-grey-200 rounded-md p-1 w-full"
                  value={requirementDetails.maxPoints}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    Number.isInteger(num)
                      ? handleChange("maxPoints", Number(e.target.value))
                      : console.log(e.target.value, "is not a number");
                  }}
                ></input>
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-4 self-end">
          <button
            onClick={() => resetForm()}
            className="cursor-pointer no-raise p-4 border border-gray-200 rounded-xl"
            type="button"
          >
            Reset Form
          </button>
          <button
            onClick={(e) => handleSubmit(e)}
            className="cursor-pointer no-raise p-2 text-white bg-blue-950 rounded-2xl"
            type="submit"
          >
            Save Requirement
          </button>
        </div>
      </form>
      <div>
        <h1 className="text-2xl font-bold m-8">Existing Requirements</h1>
        {requirements.map((requirement) => (
          <Requirement
            onUpdate={updatePointRequirement}
            onDelete={deletePointRequirement}
            req={requirement}
            key={requirement.id}
          />
        ))}
      </div>
    </div>
  );
}
