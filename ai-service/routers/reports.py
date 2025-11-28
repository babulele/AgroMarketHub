from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import csv
from datetime import datetime
from services.forecast_service import ForecastService
from utils.database import get_database

router = APIRouter()
forecast_service = ForecastService()

@router.get("/download/csv")
async def download_forecast_csv(
    forecast_type: str = Query("monthly", regex="^(daily|weekly|monthly|seasonal)$"),
    scope: str = Query("nationwide", regex="^(nationwide|county|subcounty)$"),
    county: Optional[str] = None,
    subCounty: Optional[str] = None
):
    """Download forecast data as CSV"""
    try:
        region = {}
        if county:
            region["county"] = county
        if subCounty:
            region["subCounty"] = subCounty
        
        forecasts = await forecast_service.generate_demand_forecast(
            forecast_type=forecast_type,
            scope=scope,
            region=region if region else None
        )
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Crop/Product',
            'Demand Score',
            'Price Recommendation (KES)',
            'Confidence (%)',
            'Region',
            'Forecast Date',
            'Forecast Type'
        ])
        
        # Write data
        for forecast in forecasts:
            writer.writerow([
                forecast.get('crop', forecast.get('product', 'N/A')),
                forecast.get('demand', 0),
                forecast.get('priceRecommendation', forecast.get('price_recommendation', 0)),
                forecast.get('confidence', 0),
                region.get('county', 'Nationwide') if region else 'Nationwide',
                datetime.now().strftime('%Y-%m-%d'),
                forecast_type
            ])
        
        output.seek(0)
        
        # Generate filename
        filename = f"forecast_{scope}_{forecast_type}_{datetime.now().strftime('%Y%m%d')}.csv"
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/pdf")
async def download_forecast_pdf(
    forecast_type: str = Query("monthly", regex="^(daily|weekly|monthly|seasonal)$"),
    scope: str = Query("nationwide", regex="^(nationwide|county|subcounty)$"),
    county: Optional[str] = None,
    subCounty: Optional[str] = None
):
    """Download forecast data as PDF"""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        
        region = {}
        if county:
            region["county"] = county
        if subCounty:
            region["subCounty"] = subCounty
        
        forecasts = await forecast_service.generate_demand_forecast(
            forecast_type=forecast_type,
            scope=scope,
            region=region if region else None
        )
        
        # Create PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        # Title
        title = Paragraph("AgroMarketHub Demand Forecast Report", title_style)
        elements.append(title)
        elements.append(Spacer(1, 0.2*inch))
        
        # Report metadata
        metadata = [
            ['Report Date:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ['Forecast Type:', forecast_type.capitalize()],
            ['Scope:', scope.capitalize()],
            ['Region:', region.get('county', 'Nationwide') if region else 'Nationwide'],
        ]
        
        metadata_table = Table(metadata, colWidths=[2*inch, 4*inch])
        metadata_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(metadata_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Forecast data table
        if forecasts:
            data = [['Crop/Product', 'Demand Score', 'Price (KES)', 'Confidence (%)']]
            
            for forecast in forecasts:
                data.append([
                    forecast.get('crop', forecast.get('product', 'N/A')),
                    f"{forecast.get('demand', 0)}%",
                    f"{forecast.get('priceRecommendation', forecast.get('price_recommendation', 0)):,.2f}",
                    f"{forecast.get('confidence', 0)}%"
                ])
            
            table = Table(data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')])
            ]))
            elements.append(table)
        else:
            no_data = Paragraph("No forecast data available", styles['Normal'])
            elements.append(no_data)
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        # Generate filename
        filename = f"forecast_{scope}_{forecast_type}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        return StreamingResponse(
            io.BytesIO(buffer.read()),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="PDF generation requires reportlab. Install with: pip install reportlab"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/farmer/{farmer_id}/download")
async def download_farmer_report(
    farmer_id: str,
    format: str = Query("pdf", regex="^(pdf|csv)$")
):
    """Download farmer-specific forecast report"""
    try:
        insights = await forecast_service.get_farmer_insights(farmer_id)
        
        if format == "csv":
            return await download_forecast_csv(
                forecast_type="monthly",
                scope="county"
            )
        else:
            return await download_forecast_pdf(
                forecast_type="monthly",
                scope="county"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

