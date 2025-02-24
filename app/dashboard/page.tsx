import { Button } from "@/components/ui/button";
import Layout from '@/components/molecules/layout/layout'
import Feed from '@/components/molecules/layout/feed'
import { auth } from "@/auth";


const mockPolls = [
  {
    id: '1',
    question: 'What\'s your favorite programming language?',
    options: ['JavaScript', 'Python', 'Java', 'C++'],
    votes: [150, 120, 80, 50]
  },
  {
    id: '2',
    question: 'Which frontend framework do you prefer?',
    options: ['React', 'Vue', 'Angular', 'Svelte'],
    votes: [200, 80, 70, 50]
  },
  {
    id: '3',
    question: 'What\'s your preferred method of learning?',
    options: ['Online Courses', 'Books', 'Tutorials', 'Bootcamps'],
    votes: [180, 90, 130, 60]
  }
]

export default async function Dashboard() {

  const session = await auth();
  const user = session?.user;

  console.log("user ", user)
  return (
    <div className="min-h-screen p-8">
      <div className="w-full ">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.name || 'User'}!</h1>
            <p className="text-gray-600">Manage your polls and see responses</p>
          </div>
            <Button variant="outline">Sign Out</Button>
        </div>

        {/* Add your dashboard content here */}
        <div className="bg-white p-6 rounded-lg shadow">
          <Layout>
            <Feed polls={mockPolls} />
          </Layout>
        </div>
      </div>
    </div>
  );
}
