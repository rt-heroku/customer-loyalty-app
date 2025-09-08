import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get all chat-related settings
    const settings = await Promise.all([
      pool.query('SELECT get_system_setting_or_default($1, $2) as value', ['chat_enabled', 'true']),
      pool.query('SELECT get_system_setting_or_default($1, $2) as value', ['chat_api_url', 'https://your-mulesoft-api.com/chat/v1/messages']),
      pool.query('SELECT get_system_setting_or_default($1, $2) as value', ['chat_floating_button', 'true']),
      pool.query('SELECT get_system_setting_or_default($1, $2) as value', ['chat_max_file_size', '10485760']),
      pool.query('SELECT get_system_setting_or_default($1, $2) as value', ['chat_allowed_file_types', 'image/jpeg,image/png,image/gif,application/pdf,text/plain']),
      pool.query('SELECT get_system_setting_or_default($1, $2) as value', ['chat_typing_indicator_delay', '1000']),
      pool.query('SELECT get_system_setting_or_default($1, $2) as value', ['chat_message_retry_attempts', '3']),
      pool.query('SELECT get_system_setting_or_default($1, $2) as value', ['chat_session_timeout', '3600000'])
    ]);

    const chatSettings = {
      chatEnabled: settings[0].rows[0].value === 'true',
      chatApiUrl: settings[1].rows[0].value,
      chatFloatingButton: settings[2].rows[0].value === 'true',
      maxFileSize: parseInt(settings[3].rows[0].value),
      allowedFileTypes: settings[4].rows[0].value.split(','),
      typingIndicatorDelay: parseInt(settings[5].rows[0].value),
      messageRetryAttempts: parseInt(settings[6].rows[0].value),
      sessionTimeout: parseInt(settings[7].rows[0].value)
    };

    return NextResponse.json({ settings: chatSettings });
  } catch (error) {
    console.error('Error fetching chat settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user has admin privileges (you might want to implement this check)
    // For now, we'll allow any authenticated user to update settings

    const { 
      chatEnabled, 
      chatApiUrl, 
      chatFloatingButton, 
      maxFileSize, 
      allowedFileTypes, 
      typingIndicatorDelay, 
      messageRetryAttempts, 
      sessionTimeout 
    } = await request.json();

    // Update settings using the system settings functions
    const updates = [];
    
    if (chatEnabled !== undefined) {
      updates.push(
        pool.query('SELECT set_system_setting($1, $2, $3, $4, $5)', 
          ['chat_enabled', chatEnabled.toString(), 'Enable/disable chat functionality', 'chat', user.email])
      );
    }
    
    if (chatApiUrl !== undefined) {
      updates.push(
        pool.query('SELECT set_system_setting($1, $2, $3, $4, $5)', 
          ['chat_api_url', chatApiUrl, 'Mulesoft chat API endpoint', 'chat', user.email])
      );
    }
    
    if (chatFloatingButton !== undefined) {
      updates.push(
        pool.query('SELECT set_system_setting($1, $2, $3, $4, $5)', 
          ['chat_floating_button', chatFloatingButton.toString(), 'Show floating chat button', 'chat', user.email])
      );
    }
    
    if (maxFileSize !== undefined) {
      updates.push(
        pool.query('SELECT set_system_setting($1, $2, $3, $4, $5)', 
          ['chat_max_file_size', maxFileSize.toString(), 'Maximum file size in bytes', 'chat', user.email])
      );
    }
    
    if (allowedFileTypes !== undefined) {
      updates.push(
        pool.query('SELECT set_system_setting($1, $2, $3, $4, $5)', 
          ['chat_allowed_file_types', allowedFileTypes.join(','), 'Allowed file types for chat attachments', 'chat', user.email])
      );
    }
    
    if (typingIndicatorDelay !== undefined) {
      updates.push(
        pool.query('SELECT set_system_setting($1, $2, $3, $4, $5)', 
          ['chat_typing_indicator_delay', typingIndicatorDelay.toString(), 'Delay in ms before showing typing indicator', 'chat', user.email])
      );
    }
    
    if (messageRetryAttempts !== undefined) {
      updates.push(
        pool.query('SELECT set_system_setting($1, $2, $3, $4, $5)', 
          ['chat_message_retry_attempts', messageRetryAttempts.toString(), 'Number of retry attempts for failed messages', 'chat', user.email])
      );
    }
    
    if (sessionTimeout !== undefined) {
      updates.push(
        pool.query('SELECT set_system_setting($1, $2, $3, $4, $5)', 
          ['chat_session_timeout', sessionTimeout.toString(), 'Session timeout in ms', 'chat', user.email])
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ message: 'Chat settings updated successfully' });
  } catch (error) {
    console.error('Error updating chat settings:', error);
    return NextResponse.json(
      { error: 'Failed to update chat settings' },
      { status: 500 }
    );
  }
}
