
import {
  Router,
  type ErrorRequestHandler,
} from 'express';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import Memory, { type MemoryFields } from '../models/memory.model';

const router = Router();

const allowedFields = new Set([
  'title',
  'personName',
  'relationship',
  'story',
  'favoriteThings',
  'memoryDate',
]);

function parseMemoryBody(
  body: unknown,
  partial = false,
): {
  data?: Partial<MemoryFields>;
  error?: string;
} {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    return { error: 'A valid JSON object is required.' };
  }

  const source = body as Record<string, unknown>;
  const unknownFields = Object.keys(source).filter(
    (key) => !allowedFields.has(key),
  );

  if (unknownFields.length > 0) {
    return { error: `Unknown field: ${unknownFields[0]}` };
  }

  const data: Partial<MemoryFields> = {};

  const textFields = [
    ['title', 120, true],
    ['personName', 120, true],
    ['relationship', 80, false],
    ['story', 5000, true],
  ] as const;

  for (const [key, maxLength, required] of textFields) {
    if (partial && !Object.hasOwn(source, key)) {
      continue;
    }

    const value = source[key];

    if (typeof value !== 'string') {
      if (required || value !== undefined) {
        return { error: `${key} must be a string.` };
      }
      continue;
    }

    const trimmed = value.trim();

    if ((required && !trimmed) || trimmed.length > maxLength) {
      return {
        error: `${key} is required and must not exceed ${maxLength} characters.`,
      };
    }

    if (key === 'title') data.title = trimmed;
    if (key === 'personName') data.personName = trimmed;
    if (key === 'relationship') data.relationship = trimmed;
    if (key === 'story') data.story = trimmed;
  }

  if (!partial || Object.hasOwn(source, 'favoriteThings')) {
    const things = source['favoriteThings'] ?? [];

    if (!Array.isArray(things) || things.length > 10) {
      return {
        error: 'favoriteThings must be an array of at most 10 strings.',
      };
    }

    const normalizedThings: string[] = [];

    for (const thing of things) {
      if (typeof thing !== 'string') {
        return { error: 'Each favorite thing must be a string.' };
      }

      const trimmed = thing.trim();

      if (!trimmed || trimmed.length > 100) {
        return {
          error: 'Favorite things must contain 1–100 characters.',
        };
      }

      normalizedThings.push(trimmed);
    }

    data.favoriteThings = normalizedThings;
  }

  if (Object.hasOwn(source, 'memoryDate')) {
    const value = source['memoryDate'];

    if (typeof value !== 'string' || !value.trim()) {
      return {
        error: 'memoryDate must be a valid date string.',
      };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return { error: 'memoryDate is not a valid date.' };
    }

    data.memoryDate = date;
  }

  return { data };
}

// Connect before running database operations.
router.use(async (_req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error(
      'Memory API database connection failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    res.status(503).json({
      success: false,
      message: 'Memory storage is temporarily unavailable.',
    });
  }
});

// GET /api/memories — list the 50 most recently updated memories.
router.get('/', async (_req, res) => {
  const memories = await Memory.find()
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  res.json({
    success: true,
    data: memories,
  });
});

// GET /api/memories/:id — get a single memory.
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!/^[a-f\d]{24}$/i.test(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid memory ID.',
    });
    return;
  }

  const memory = await Memory.findById(id).lean();

  if (!memory) {
    res.status(404).json({
      success: false,
      message: 'Memory not found.',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: memory,
  });
});

// POST /api/memories — create a memory.
router.post('/', async (req, res) => {
  const parsed = parseMemoryBody(req.body);

  if (parsed.error || !parsed.data) {
    res.status(400).json({
      success: false,
      message: parsed.error ?? 'Invalid memory data.',
    });
    return;
  }

  const memory = await Memory.create(
    parsed.data as MemoryFields,
  );

  res.status(201).json({
    success: true,
    data: memory,
  });
});

// PATCH /api/memories/:id — update selected fields.
router.patch('/:id', async (req, res) => {
  const { id } = req.params;

  if (!/^[a-f\d]{24}$/i.test(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid memory ID.',
    });
    return;
  }

  const parsed = parseMemoryBody(req.body, true);

  if (parsed.error || !parsed.data) {
    res.status(400).json({
      success: false,
      message: parsed.error ?? 'Invalid memory data.',
    });
    return;
  }

  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({
      success: false,
      message: 'Provide at least one field to update.',
    });
    return;
  }

  const memory = await Memory.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!memory) {
    res.status(404).json({
      success: false,
      message: 'Memory not found.',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: memory,
  });
});

// DELETE /api/memories/:id — delete a memory.
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!/^[a-f\d]{24}$/i.test(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid memory ID.',
    });
    return;
  }

  const memory = await Memory.findByIdAndDelete(id);

  if (!memory) {
    res.status(404).json({
      success: false,
      message: 'Memory not found.',
    });
    return;
  }

  res.status(204).end();
});

const handleMemoryError: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Memory validation failed.',
    });
    return;
  }

  console.error('Memory API error:', error);

  res.status(500).json({
    success: false,
    message: 'Unable to process the memory request.',
  });
};

router.use(handleMemoryError);

export default router;
