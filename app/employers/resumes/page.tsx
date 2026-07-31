'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, FileText, Search, User } from 'lucide-react';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Resume = {
  id: string;
  firstName: string;
  lastName: string;
  majors: string[];
  gradYear: number | null;
  linkedin: string | null;
  headshotBlobURL: string | null;
  resumeBlobURL: string | null;
};

type ResumeFilter = 'All' | 'With LinkedIn';

function fullName(student: Resume) {
  const name = [student.firstName, student.lastName].filter(Boolean).join(' ').trim();
  return name || 'Unknown Student';
}

function majorLabel(student: Resume) {
  return student.majors?.length ? student.majors.join(', ') : 'No major listed';
}

function graduationLabel(student: Resume) {
  return student.gradYear ? `Class of ${student.gradYear}` : 'No grad year';
}

export default function EmployerResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ResumeFilter>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadResumes() {
      try {
        const res = await fetch('/api/employers/resumes');

        if (!res.ok) {
          setError(
            res.status === 401
              ? 'Please sign in to view student resumes.'
              : res.status === 403
                ? 'Your employer account is not approved to view resumes.'
                : 'Unable to load resumes.'
          );
          return;
        }

        const data = await res.json();
        setResumes(data.resumes ?? []);
      } catch {
        setError('Unable to load resumes.');
      } finally {
        setLoading(false);
      }
    }

    loadResumes();
  }, []);

  const filteredResumes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return resumes.filter((student) => {
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'With LinkedIn' && Boolean(student.linkedin));

      const haystack = [
        fullName(student),
        majorLabel(student),
        graduationLabel(student),
      ].join(' ').toLowerCase();

      return matchesFilter && (!normalizedSearch || haystack.includes(normalizedSearch));
    });
  }, [activeFilter, resumes, search]);

  const filters: ResumeFilter[] = ['All', 'With LinkedIn'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-transparent transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white transition-colors duration-300">
          Student Resumes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
          Browse submitted resumes from approved KTP members.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              onClick={() => setActiveFilter(filter)}
              className={
                `cursor-pointer transition-colors ${
                  activeFilter === filter
                    ? ''
                    : 'text-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-white'
                }`
              }
            >
              {filter}
              <span className="ml-2 text-sm font-semibold">
                ({resumes.filter((student) => {
                  if (filter === 'All') return true;
                  if (filter === 'With LinkedIn') return Boolean(student.linkedin);
                  return !student.linkedin;
                }).length})
              </span>
            </Button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, major, or year..."
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeFilter === 'All' ? 'All Resumes' : activeFilter} ({filteredResumes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
              Loading resumes...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 dark:text-red-400 transition-colors duration-300">
              {error}
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
              No resumes found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Major</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResumes.map((student) => {
                    const studentName = fullName(student);
                    const headshotUrl = student.headshotBlobURL;

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
                          <div className="flex min-w-[180px] items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-blue-200 bg-white/30 transition-colors duration-300 dark:border-gray-600 dark:bg-gray-800">
                              {headshotUrl ? (
                                <Image
                                  src={headshotUrl}
                                  alt={`${studentName} headshot`}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                              )}
                            </span>
                            <span>{studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                          {graduationLabel(student)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                          {majorLabel(student)}
                        </TableCell>
                        <TableCell>
                          {student.linkedin ? (
                            <Badge variant="secondary">Added</Badge>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              Not listed
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {student.resumeBlobURL ? (
                              <Button asChild size="sm" variant="outline">
                                <a href={student.resumeBlobURL} target="_blank" rel="noreferrer">
                                  <FileText className="h-4 w-4" />
                                  Resume
                                </a>
                              </Button>
                            ) : null}

                            {student.linkedin ? (
                              <Button asChild size="sm" variant="ghost">
                                <a href={student.linkedin} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                  LinkedIn
                                </a>
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
