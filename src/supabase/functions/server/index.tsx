import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Health check
app.get('/make-server-1bb78cb7/health', (c) => {
  return c.json({ status: 'ok' });
});

// Sign up endpoint for store owner
app.post('/make-server-1bb78cb7/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || 'Store Owner' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Error creating user:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      message: 'User created successfully',
      user: { id: data.user.id, email: data.user.email }
    });

  } catch (err) {
    console.log('Signup error:', err);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

Deno.serve(app.fetch);
