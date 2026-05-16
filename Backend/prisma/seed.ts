import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'process';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.seekerProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  // Create Users & Profiles
  // 1. Seeker: Jean Dupont
  const jean = await prisma.user.create({
    data: {
      email: 'jean@mail.com',
      name: 'Jean Dupont',
      phone: '+237 655 111 222',
      role: 'Job Seeker',
      password,
      seekerProfile: {
        create: {
          city: 'Abidjan, CI',
          title: 'Software Engineer',
          yearsExp: '3–5',
          skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
          cvUploaded: true,
          profileCompletion: 85,
          education: { degree: "Bachelor's", field: "Computer Science", institution: "Université de Cocody", year: 2021 },
          preferences: { seeking: "Both", sector: "Technology", city: "Abidjan", availableFrom: "2025-03-01" },
        }
      }
    }
  });

  // 2. Recruiter: Paul Tremblay
  const paul = await prisma.user.create({
    data: {
      email: 'paul@techcorp.com',
      name: 'Paul Tremblay',
      phone: '+237 670 333 444',
      role: 'Recruiter',
      password,
      recruiterProfile: {
        create: {
          company: 'TechCorp',
          industry: 'Technology',
          companySize: '51–200',
          website: 'https://techcorp.ci',
          hqLocation: 'Abidjan, CI',
          logoUploaded: true,
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      email: 'admin@bridge.com',
      name: 'Admin User',
      phone: '+237 600 000 000',
      role: 'Admin',
      password,
    },
  });

  // Create Jobs
  const job1 = await prisma.job.create({
    data: {
      title: "Senior Software Engineer",
      company: "TechCorp",
      companyId: 1,
      location: "Abidjan, CI",
      type: "Full-time",
      sector: "Technology",
      description: "Join our engineering team to build scalable backend services.",
      requirements: ["5+ years of experience", "Proficiency in Node.js or Python"],
      responsibilities: ["Design and maintain RESTful APIs", "Lead code reviews"],
      skills: ["Node.js", "Python", "PostgreSQL", "Docker", "AWS"],
      minEducation: "Bachelor's",
      minExperience: "5+ years",
      postedByUserId: paul.id,
    }
  });

  const job2 = await prisma.job.create({
    data: {
      title: "Marketing Intern",
      company: "BrandCo",
      companyId: 2,
      location: "Dakar, SN",
      type: "Internship",
      sector: "Marketing",
      description: "A 3-month internship to support the marketing team.",
      requirements: ["Currently enrolled in a Marketing degree"],
      responsibilities: ["Draft social media content calendars"],
      skills: ["Social Media", "Copywriting", "Excel"],
      minEducation: "In progress",
      minExperience: "0–1 year",
    }
  });

  // Create Applications
  await prisma.application.create({
    data: {
      userId: jean.id,
      jobId: job1.id,
      paymentStatus: 'Validated',
      cvStatus: 'Uploaded',
      recruiterInterest: 'Interested',
      contactAccessStatus: 'Pending',
    }
  });

  // Create Payments
  await prisma.payment.create({
    data: {
      userId: jean.id,
      jobId: job1.id,
      method: 'Orange Money',
      amount: '2,000 XAF',
      reference: 'ATS-2025-00481',
      status: 'Validated'
    }
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
