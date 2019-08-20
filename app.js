// Requires
const { join } = require('path');
const moment = require('moment');
const pdf = require('html-pdf');
const { promisify } = require('util');
const read = promisify(require('fs').readFile);
const handlebars = require('handlebars');


// PDF Options
const pdf_options = { format: 'A4', quality: 300 };

// GeneratePDF
async function generatePDF() {
    // Data we're going to pass to Handlebars
    const data = {
        mycompany: {
            name: 'NAD GLOBAL',
            address: 'Avenida Universidad',
            city: 'Dolores Hidalgo',
            zipcode: '37900'
        },
        customer: {},
        invoice_no: generateInvoiceNo(),
        date_created: moment().format('DD/MM/YYYY'),
        date_due: moment().add(14, 'days').format('DD/MM/YYYY')
    };

    // Add customer data
    data.customer = {
        org: 'MX',
        name: 'Alejandro Ruiz García',
        email: 'alejandoruizg98@gmail.com'
    };

    data.products = [{
            name: 'Sistema HONDA',
            price: 150.000
        },
        {
            name: 'Sistema NISSAN',
            price: 80.000
        },
        {
            name: 'Sistema MAZDA',
            price: 75.000
        },
        {
            name: 'Sistema ALPURA',
            price: 40.000
        },
        {
            name: 'Sistema AVEO',
            price: 18.000
        }
    ];

    const total = data.products.map(product => product.price).reduce((a, b) => a + b, 0);

    data.exvat = (total - (total / 1.21)).toFixed(2);

    data.total = total.toFixed(2);

    data.products.forEach(product => product.price = product.price.toFixed(2));

    // Read source template
    const source = await read(join(`${__dirname}/template.html`), 'utf-8');

    // Convert to Handlebars template and add the data
    const template = handlebars.compile(source);
    const html = template(data);

    // Generate PDF and promisify the toFile function
    const p = pdf.create(html, pdf_options);
    p.toFile = promisify(p.toFile);

    // Saves the file to the File System as invoice.pdf in the current directory
    await p.toFile(`${join(__dirname, 'Factura.pdf')}`);

};

function generateInvoiceNo() {
    return moment().format('YYYYMMDD');
}

generatePDF();