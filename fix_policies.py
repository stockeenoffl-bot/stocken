import re

with open('supabase_schema.sql', 'r') as f:
    lines = f.readlines()

new_lines = []
policy_pattern = re.compile(r'CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([^\s]+)\s+FOR')

for line in lines:
    match = policy_pattern.search(line)
    if match:
        policy_name = match.group(1)
        table_name = match.group(2)
        drop_statement = f'DROP POLICY IF EXISTS "{policy_name}" ON {table_name};\n'
        new_lines.append(drop_statement)
    new_lines.append(line)

with open('supabase_schema.sql', 'w') as f:
    f.writelines(new_lines)

print("Fixed policies in supabase_schema.sql")
