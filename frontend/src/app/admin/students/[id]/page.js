import StudentDetailClient from '@/components/StudentDetailClient';

export default async function StudentDetailPage({ params }) {
  return <StudentDetailClient studentId={params.id} />;
}
