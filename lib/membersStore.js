import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const dataFilePath = path.join(process.cwd(), "data", "members.json");

async function ensureDataFile() {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });

  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, "[]", "utf8");
  }
}

async function readMembersFile() {
  await ensureDataFile();
  const fileContents = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(fileContents);
}

async function writeMembersFile(members) {
  await ensureDataFile();
  const formattedJson = JSON.stringify(members, null, 2);
  await fs.writeFile(dataFilePath, formattedJson, "utf8");
}

function toLessonNumber(value, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return fallback;
  }

  return Math.floor(number);
}

export async function getMembers() {
  const members = await readMembersFile();
  return members.sort((first, second) => {
    return new Date(second.updatedAt) - new Date(first.updatedAt);
  });
}

export async function getMemberById(id) {
  const members = await readMembersFile();
  return members.find((member) => member.id === id);
}

export async function createMember(data) {
  const members = await readMembersFile();
  const now = new Date().toISOString();
  const totalLessons = toLessonNumber(data.totalLessons);
  const remainingLessons = toLessonNumber(data.remainingLessons, totalLessons);

  const member = {
    id: randomUUID(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    memo: data.memo.trim(),
    totalLessons,
    remainingLessons: Math.min(remainingLessons, totalLessons),
    createdAt: now,
    updatedAt: now
  };

  members.push(member);
  await writeMembersFile(members);

  return member;
}

export async function updateMember(id, data) {
  const members = await readMembersFile();
  const now = new Date().toISOString();
  let updatedMember = null;

  const updatedMembers = members.map((member) => {
    if (member.id !== id) {
      return member;
    }

    const totalLessons = toLessonNumber(data.totalLessons, member.totalLessons);
    const remainingLessons = toLessonNumber(
      data.remainingLessons,
      member.remainingLessons
    );

    updatedMember = {
      ...member,
      name: data.name.trim(),
      phone: data.phone.trim(),
      memo: data.memo.trim(),
      totalLessons,
      remainingLessons: Math.min(remainingLessons, totalLessons),
      updatedAt: now
    };

    return updatedMember;
  });

  await writeMembersFile(updatedMembers);
  return updatedMember;
}

export async function deleteMember(id) {
  const members = await readMembersFile();
  const remainingMembers = members.filter((member) => member.id !== id);
  await writeMembersFile(remainingMembers);
}
