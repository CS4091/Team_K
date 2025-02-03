import {test, expect, chromium, }  from '@playwright/test';

test('header test', async ({page}) => {
    await page.goto('http://localhost:5173/')
    const titleButton = page.getByRole('button', { name: 'Miner Board' })
    await expect(titleButton).toBeVisible()
})

test('search', async ({page}) => {
    await page.goto('http://localhost:5173/')
    await page.getByPlaceholder('Search posts...').fill('john')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.getByText('john').first()).toBeVisible()
})


test('navigate to create page', async ({page}) => {
    await page.goto('http://localhost:5173/')
    await page.getByLabel('Create Post').click()
    await expect(page.getByRole('heading', { name: 'Create Post' })).toBeVisible()
    await page.getByRole('button', { name: 'Miner Board' }).click()
    await expect(page.getByRole('heading', { name: 'Miner Board' })).toBeVisible()
})

test('navigate back to home page', async ({page}) => {
    await page.goto('http://localhost:5173/')
    await page.getByLabel('Create Post').click()
    await expect(page.getByRole('heading', { name: 'Create Post' })).toBeVisible()
})

test('Class search works', async ({page}) => {
    await page.goto('http://localhost:5173/')
    await page.getByLabel('Search Class').fill('algo')
    await page.getByRole('option', { name: 'Algorithms' }).click()
    await page.getByText('Go to class').click()
    await expect(page.getByRole('heading', { name: 'Algorithms', exact: true })).toBeVisible()

})

test('Algorithms page works', async ({page}) => {
    await page.goto('http://localhost:5173/class/Algorithms')
    await expect(page.getByRole('heading', { name: 'Algorithms', exact: true })).toBeVisible()
})

test('Opening first post on algorithms page', async ({page}) => {
    await page.goto('http://localhost:5173/class/Algorithms')
    await expect(page.getByRole('heading', { name: 'Algorithms', exact: true })).toBeVisible()
    const cardTitle = await page.locator('h6').nth(1).textContent()
    console.log(cardTitle)
    await page.locator('.MuiBox-root > .MuiButtonBase-root').first().click()
    const title = await page.locator('b').first().textContent()
    console.log(title)
    expect(title).toBe(cardTitle)
})

test('Return to algorithms page', async ({page}) => {
    await page.goto('http://localhost:5173/class/Algorithms')
    await expect(page.getByRole('heading', { name: 'Algorithms', exact: true })).toBeVisible()
    await page.locator('.MuiBox-root > .MuiButtonBase-root').first().click()
    await page.getByText('Algorithms', { exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Algorithms', exact: true })).toBeVisible()
})

test('User Sign in', async ({page}) => {
    await page.goto('http://localhost:5173/')
    await page.getByLabel('Sign in').click()
    await page.getByRole('textbox').first().fill('kevin1')
    await page.locator('input[type="password"]').fill('kevin1')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByLabel('kevin1').hover()
    await expect(page.getByLabel('kevin1')).toBeVisible()
})

test('User Page', async ({page}) => {
    await page.goto('http://localhost:5173/')
    await page.getByLabel('Sign in').click()
    await page.getByRole('textbox').first().fill('kevin1')
    await page.locator('input[type="password"]').fill('kevin1')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByLabel('kevin1').click()
    await expect(page.getByRole('heading', { name: 'Posts for: kevin1' })).toBeVisible()
})

