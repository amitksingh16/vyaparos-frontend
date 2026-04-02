const { User, Business, ComplianceItem } = require('./src/models');
const { generateInitialCompliances } = require('./src/controllers/complianceController');

async function test() {
    try {
        const user = await User.create({ phone: '6662223334', role: 'owner' });
        const b = await Business.create({
            owner_id: user.id,
            business_name: 'Test Setup Biz',
            business_type: 'prop',
            gstin: '27AAAAA0000A1Z5',
            filing_type: 'qrmp'
        });

        console.log("Business created", b.id);

        await generateInitialCompliances(b);

        const items = await ComplianceItem.findAll({ where: { business_id: b.id } });
        console.log('Generated count:', items.length);

        items.forEach(i => console.log(i.compliance_type, i.due_date, i.frequency, i.notes));
    } catch (e) {
        console.error('BIG ERR', e.message);
        if (e.original) console.error('Original SQL Error:', e.original.message);
    }
}
test();
