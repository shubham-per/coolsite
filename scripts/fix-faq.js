
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function fixFaq() {
    console.log('Checking for FAQ window...');

    // 1. Check if it exists
    const { data: existing, error: findError } = await supabase
        .from('windows')
        .select('*')
        .eq('key', 'faq');

    if (findError) {
        console.error('Error finding FAQ:', findError);
        return;
    }

    console.log('Existing FAQ entries:', existing);

    if (existing && existing.length > 0) {
        console.log('FAQ window already exists. Updating it to ensure correctness...');
        const { error: updateError } = await supabase
            .from('windows')
            .update({
                label: 'FAQ',
                type: 'builtIn',
                show_on_desktop: false,
                show_in_home: true,
                order_desktop: 6,
                order_home: 6,
                is_hidden: false,
                is_archived: false,
                layout: 'content',
                icon: 'help-circle'
            })
            .eq('key', 'faq');

        if (updateError) console.error('Update Error:', updateError);
        else console.log('Updated successfully.');
    } else {
        console.log('FAQ window missing. Inserting...');
        const { data: inserted, error: insertError } = await supabase
            .from('windows')
            .insert({
                key: 'faq',
                label: 'FAQ',
                type: 'builtIn',
                show_on_desktop: false,
                show_in_home: true,
                order_desktop: 6,
                order_home: 6,
                is_hidden: false,
                is_archived: false,
                layout: 'content',
                icon: 'help-circle'
            })
            .select();

        if (insertError) console.error('Insert Error:', insertError);
        else console.log('Inserted:', inserted);
    }

    // 2. verify simple select *
    const { data: allWindows } = await supabase.from('windows').select('key, type, is_archived');
    console.log('All Windows:', allWindows);
}

fixFaq();
