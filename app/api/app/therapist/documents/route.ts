import { NextRequest, NextResponse } from "next/server";
import {
	listDocuments,
	addDocument,
	removeDocument,
	AddDocumentData,
} from "@/lib/services/app/therapist.service";
import {
	therapistErrorResponse,
	validationError,
} from "@/lib/services/app/therapist.errors";

/**
 * GET /api/app/therapist/documents?supabaseId=<uuid>
 *
 * List the therapist's uploaded verification documents.
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");

		if (!supabaseId) {
			return validationError("Missing supabaseId query parameter");
		}

		const data = await listDocuments(supabaseId);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}

/**
 * POST /api/app/therapist/documents
 *
 * Register a document the app uploaded to the `therapist-documents`
 * storage bucket.
 * Body: { supabase_id, document_type, file_url, file_name, mime_type?, size_kb? }
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { supabase_id, ...doc } = body as {
			supabase_id: string;
		} & AddDocumentData;

		if (!supabase_id) {
			return validationError("Missing supabase_id in request body");
		}
		if (!doc.document_type || !doc.file_url || !doc.file_name) {
			return validationError(
				"Missing required fields: document_type, file_url, file_name"
			);
		}

		const data = await addDocument(supabase_id, doc);
		return NextResponse.json({ success: true, data });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}

/**
 * DELETE /api/app/therapist/documents?supabaseId=<uuid>&documentId=<id>
 *
 * Soft-delete one of the therapist's own documents.
 */
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const supabaseId = searchParams.get("supabaseId");
		const documentId = Number(searchParams.get("documentId"));

		if (!supabaseId) {
			return validationError("Missing supabaseId query parameter");
		}
		if (!documentId) {
			return validationError("Missing documentId query parameter");
		}

		await removeDocument(supabaseId, documentId);
		return NextResponse.json({ success: true });
	} catch (err: unknown) {
		return therapistErrorResponse(err);
	}
}
