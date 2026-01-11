"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import membersData from "../../../data/members.json";

// Let's... let's not talk about this [sorry Braden :( ]
interface MemberData {
  name: string;
  year?: string;
  major?: string;
  role?: string;
  imageUrl?: string;
  category?: string;
  linkedin?: string;
}

interface Member {
  id: number;
  name: string;
  classification?: string;
  major?: string;
  type: "Active" | "Exec" | "New Member";
  execPosition?: string;
}

const EXEC_POSITIONS = [
  "President",
  "Vice President",
  "Executive Secretary",
  "Director of Outreach",
  "Director of Marketing",
  "Director of Finance",
  "Director of Technical Development",
  "Director of Professional Development",
  "Director of Engagement",
  "Conferences & Hackathons Chair",
  "Infrastructure Chair",
];

export default function ModifyRoster() {
  // Parse members.json and create member list with Exec and Active types
  const initializeMembers = useMemo(() => {
    const members: Member[] = [];
    let id = 1;

    // Add E-Board members as Exec
    membersData.eBoard.forEach((member: MemberData) => {
      members.push({
        id: id++,
        name: member.name,
        classification: member.year,
        major: member.major,
        type: "Exec",
        execPosition: member.role,
      });
    });

    // Add Chairs as Exec
    membersData.chairs.forEach((member: MemberData) => {
      members.push({
        id: id++,
        name: member.name,
        classification: member.year,
        major: member.major,
        type: "Exec",
        execPosition: member.role,
      });
    });

    // Add Actives
    membersData.actives.forEach((member: MemberData) => {
      members.push({
        id: id++,
        name: member.name,
        classification: member.year,
        major: member.major,
        type: "Active",
      });
    });

    return members;
  }, []);

  const [members, setMembers] = useState<Member[]>(initializeMembers);
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Active" | "Exec" | "New Member"
  >("All");

  const filteredMembers =
    activeFilter === "All"
      ? members
      : members.filter((m) => m.type === activeFilter);

  const handleTypeChange = (id: number, newType: "Active" | "Exec" | "New Member") => {
    setMembers(
      members.map((m) =>
        m.id === id
          ? { ...m, type: newType, execPosition: newType === "Exec" ? m.execPosition : undefined }
          : m
      )
    );
  };

  const handlePositionChange = (id: number, position: string | null) => {
    setMembers(
      members.map((m) =>
        m.id === id
          ? { ...m, execPosition: position || undefined }
          : m
      )
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Modify Chapter Roster</h1>
        <p className="text-gray-600">
          Manage member types and executive positions for all chapter members.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(["All", "Active", "Exec", "New Member"] as const).map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            onClick={() => setActiveFilter(filter)}
            className="cursor-pointer"
          >
            {filter}
            <span className="ml-2 text-sm font-semibold">
              ({members.filter((m) => (filter === "All" ? true : m.type === filter)).length})
            </span>
          </Button>
        ))}
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeFilter === "All" ? "All Members" : `${activeFilter} Members`} (
            {filteredMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No members found in this category.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Major</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Exec Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell className="text-sm capitalize">
                        {member.classification || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{member.major || "—"}</TableCell>

                      {/* Type Selector */}
                      <TableCell>
                        <Select
                          value={member.type}
                          onValueChange={(value) =>
                            handleTypeChange(member.id, value as "Active" | "Exec" | "New Member")
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Exec">Exec</SelectItem>
                            <SelectItem value="New Member">New Member</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Exec Position - only show for Exec members */}
                      <TableCell>
                        {member.type === "Exec" ? (
                          <Select
                            value={member.execPosition || "none"}
                            onValueChange={(value) =>
                              handlePositionChange(member.id, value === "none" ? null : value)
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No Position</SelectItem>
                              {EXEC_POSITIONS.map((pos) => (
                                <SelectItem key={pos} value={pos}>
                                  {pos}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {members.filter((m) => m.type === "Active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Exec Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {members.filter((m) => m.type === "Exec").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              New Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {members.filter((m) => m.type === "New Member").length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
