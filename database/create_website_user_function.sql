-- PostgreSQL function to create a website user and associated patient record
-- This function ensures ACID compliance by wrapping all operations in a transaction

CREATE OR REPLACE FUNCTION create_website_user_with_patient(
    p_supabase_id UUID,
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_email VARCHAR(255),
    p_phone_number VARCHAR(255)
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id INTEGER;
    v_patient_id INTEGER;
    v_result JSON;
BEGIN
    -- Start transaction (implicit in function)
    
    -- Step 1: Insert into users table
    INSERT INTO users (
        phone_number,
        email,
        supabase_id,
        first_name,
        last_name,
        user_type,
        is_website_user
    ) VALUES (
        p_phone_number,
        p_email,
        p_supabase_id,
        p_first_name,
        p_last_name,
        'Patient'::user_types,  -- Assuming 'Patient' is a valid user_type
        TRUE
    )
    RETURNING id INTO v_user_id;
    
    -- Step 2: Insert into patients table
    INSERT INTO patients (
        user_id,
        date_of_birth,
        gender,
        blood_type,
        marital_status,
        preferred_language,
        has_insurance,
        status
    ) VALUES (
        v_user_id,
        '1990-01-01'::DATE,  -- Default date, can be updated later
        'Unknown'::gender_types,
        'Unknown'::blood_types,
        'Single'::marital_statuses,
        'English'::supported_languages,
        FALSE,
        'Active'::patient_account_statuses
    )
    RETURNING id INTO v_patient_id;
    
    -- Return success result
    v_result := json_build_object(
        'success', true,
        'user_id', v_user_id,
        'patient_id', v_patient_id,
        'message', 'User and patient records created successfully'
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Return error result
        v_result := json_build_object(
            'success', false,
            'error_code', SQLSTATE,
            'error_message', SQLERRM,
            'message', 'Failed to create user and patient records'
        );
        
        RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION create_website_user_with_patient(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION create_website_user_with_patient(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO service_role;

-- Example usage:
-- SELECT create_website_user_with_patient(
--     'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
--     'John',
--     'Doe',
--     'john.doe@example.com',
--     '+1234567890'
-- );
