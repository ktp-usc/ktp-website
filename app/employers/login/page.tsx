import { redirect } from 'next/navigation';

export default function EmployerLoginPage() {
  redirect('/auth/sign-in?redirectTo=/employers/resumes');
}